const fs = require('fs');
const path = require('path');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../uploads/resumes');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'resume-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    const allowedTypes = ['.pdf', '.doc', '.docx', '.txt'];
    const ext = path.extname(file.originalname).toLowerCase();
    
    // Allow files with valid extensions
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF, DOC, DOCX, and TXT files are allowed'));
    }
  }
});

// Function to extract text from different file types
async function extractTextFromFile(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  
  try {
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }

    if (ext === '.pdf') {
      try {
        const dataBuffer = fs.readFileSync(filePath);
        if (!dataBuffer || dataBuffer.length === 0) {
          throw new Error('PDF file is empty');
        }
        
        // Verify file is actually a PDF by checking magic bytes
        const pdfHeader = dataBuffer.slice(0, 4).toString();
        if (pdfHeader !== '%PDF') {
          throw new Error('File does not appear to be a valid PDF');
        }
        
        try {
          const data = await pdfParse(dataBuffer, {
            max: 0 // 0 = parse all pages
          });
          
          if (!data) {
            throw new Error('PDF parsing returned no data');
          }
          
          // Check if text exists and has content
          if (!data.text) {
            throw new Error('PDF contains no extractable text (may be image-based or encrypted)');
          }
          
          const textContent = data.text.trim();
          if (textContent.length === 0) {
            throw new Error('PDF contains no extractable text (may be image-based or encrypted)');
          }
          
          return textContent;
        } catch (parseError) {
          console.error('PDF parse error details:', {
            message: parseError.message,
            name: parseError.name,
            stack: parseError.stack
          });
          
          // Provide more specific error messages
          if (parseError.message && parseError.message.includes('Invalid PDF')) {
            throw new Error('Invalid PDF file format');
          }
          if (parseError.message && parseError.message.includes('encrypted')) {
            throw new Error('PDF is password protected or encrypted');
          }
          
          throw new Error(`PDF parsing failed: ${parseError.message || 'Unknown error'}`);
        }
      } catch (fileError) {
        // Re-throw if it's already our formatted error
        if (fileError.message && fileError.message.includes('PDF')) {
          throw fileError;
        }
        // Otherwise wrap file read errors
        console.error('File read error:', fileError);
        throw new Error(`Failed to read PDF file: ${fileError.message}`);
      }
    } else if (ext === '.docx') {
      const result = await mammoth.extractRawText({ path: filePath });
      if (!result || !result.value) {
        throw new Error('No text content found in DOCX file');
      }
      return result.value;
    } else if (ext === '.doc') {
      // For .doc files, mammoth might not work well
      // Try mammoth first, if it fails, return empty content
      try {
        const result = await mammoth.extractRawText({ path: filePath });
        if (result && result.value) {
          return result.value;
        }
      } catch (docError) {
        console.warn('Mammoth failed to parse .doc file, trying alternative method:', docError.message);
      }
      // Fallback: try to read as text (might not work for binary .doc files)
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        if (content && content.trim()) {
          return content;
        }
      } catch (textError) {
        console.warn('Failed to read .doc as text:', textError.message);
      }
      throw new Error('Unable to extract text from .doc file. Please convert to PDF or DOCX format.');
    } else if (ext === '.txt') {
      const content = fs.readFileSync(filePath, 'utf8');
      if (!content || !content.trim()) {
        throw new Error('TXT file is empty');
      }
      return content;
    } else {
      throw new Error(`Unsupported file type: ${ext}`);
    }
  } catch (error) {
    console.error('Error extracting text from file:', error);
    throw new Error(`Failed to extract text from ${ext} file: ${error.message}`);
  }
}

// Simple resume parsing function (you can integrate with AI services like OpenAI, AWS Textract, etc.)
async function parseResume(filePath) {
  try {
    // Extract text from the file based on its type
    const content = await extractTextFromFile(filePath);
    
    // Validate that we have content
    if (!content || !content.trim()) {
      throw new Error('Resume file appears to be empty or contains no readable text');
    }
    
    // Extract email
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    const emails = content.match(emailRegex) || [];
    const email = emails[0] || '';
    
    // Extract phone numbers
    const phoneRegex = /(\+?91[\s-]?)?[6-9]\d{9}|(\+?91[\s-]?)?[0-9]{10}/g;
    const phones = content.match(phoneRegex) || [];
    const phone = phones[0] || '';
    
    // Extract name (look for common patterns)
    // Try multiple patterns for name extraction
    let firstName = '';
    let lastName = '';
    
    // Pattern 1: Look for "Name:" or "Full Name:" followed by name
    const nameRegex1 = /(?:Name|Full Name|First Name|Last Name)[\s:]*([A-Za-z\s]+)/i;
    const nameMatch1 = content.match(nameRegex1);
    
    // Pattern 2: Look for name at the beginning of the document (first line)
    const lines = content.split('\n').filter(line => line.trim());
    const firstLine = lines[0] || '';
    const nameRegex2 = /^([A-Za-z\s]+)$/;
    const nameMatch2 = firstLine.match(nameRegex2);
    
    // Pattern 3: Look for name followed by title/position
    const nameRegex3 = /^([A-Za-z\s]+)\s*(?:Software Engineer|Developer|Manager|Analyst|Designer)/i;
    const nameMatch3 = content.match(nameRegex3);
    
    let fullName = '';
    if (nameMatch1) {
      fullName = nameMatch1[1].trim();
    } else if (nameMatch2 && nameMatch2[1].trim().length > 2) {
      fullName = nameMatch2[1].trim();
    } else if (nameMatch3) {
      fullName = nameMatch3[1].trim();
    }
    
    if (fullName) {
      const nameParts = fullName.split(' ').filter(part => part.trim());
      firstName = nameParts[0] || '';
      lastName = nameParts.slice(1).join(' ') || '';
    }
    
    // Extract skills
    const skillsRegex = /(?:Skills|Technical Skills|Core Competencies)[\s:]*([A-Za-z\s,]+)/i;
    const skillsMatch = content.match(skillsRegex);
    const skills = skillsMatch ? skillsMatch[1].split(',').map(s => s.trim()).filter(s => s) : [];
    
    // Extract experience
    const expRegex = /(?:Experience|Work Experience|Professional Experience)[\s:]*([0-9]+(?:\.[0-9]+)?)\s*(?:years?|yrs?)/i;
    const expMatch = content.match(expRegex);
    const experience = expMatch ? expMatch[1] : '';
    
    // Extract education
    const eduRegex = /(?:Education|Academic|Qualification)[\s:]*([A-Za-z\s,0-9]+)/i;
    const eduMatch = content.match(eduRegex);
    const education = eduMatch ? eduMatch[1] : '';
    
    // Extract current job title
    const jobTitleRegex = /(?:Current|Present|Position|Title)[\s:]*([A-Za-z\s]+)/i;
    const jobTitleMatch = content.match(jobTitleRegex);
    const currentJobTitle = jobTitleMatch ? jobTitleMatch[1].trim() : '';
    
    // Extract current company
    const companyRegex = /(?:Company|Organization|Employer)[\s:]*([A-Za-z\s&.,]+)/i;
    const companyMatch = content.match(companyRegex);
    const currentCompany = companyMatch ? companyMatch[1].trim() : '';
    
    // Extract location
    const locationRegex = /(?:Location|Address|City)[\s:]*([A-Za-z\s,]+)/i;
    const locationMatch = content.match(locationRegex);
    const location = locationMatch ? locationMatch[1].trim() : '';
    
    // Extract date of birth
    let dateOfBirth = '';
    const dobRegex1 = /(?:Date of Birth|DOB|Birth Date|Born)[\s:]*([0-9]{1,2}[\/\-\.][0-9]{1,2}[\/\-\.][0-9]{2,4})/i;
    const dobMatch1 = content.match(dobRegex1);
    if (dobMatch1) {
      dateOfBirth = dobMatch1[1].trim();
    } else {
      // Try alternative formats
      const dobRegex2 = /([0-9]{1,2}[\/\-\.][0-9]{1,2}[\/\-\.][0-9]{2,4})/;
      const allDates = content.match(/\b\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}\b/g);
      if (allDates && allDates.length > 0) {
        // Use the first date found as DOB
        dateOfBirth = allDates[0];
      }
    }
    
    return {
      firstName,
      lastName,
      email,
      phone,
      dateOfBirth,
      skills: skills.join(', '),
      experience,
      education,
      currentJobTitle,
      currentCompany,
      location,
      rawContent: content.substring(0, 1000) // First 1000 characters for reference
    };
  } catch (error) {
    console.error('Error parsing resume:', error);
    throw new Error(`Failed to parse resume: ${error.message}`);
  }
}

// Enhanced AI-powered resume parsing (integrate with OpenAI or similar service)
async function parseResumeWithAI(filePath) {
  try {
    // For now, we'll use the basic parsing
    // In production, you would:
    // 1. Convert PDF/DOC to text using libraries like pdf-parse, mammoth
    // 2. Send text to OpenAI API for structured extraction
    // 3. Return structured data
    
    if (!filePath) {
      throw new Error('File path is required');
    }
    
    if (!fs.existsSync(filePath)) {
      throw new Error(`File does not exist: ${filePath}`);
    }
    
    const basicData = await parseResume(filePath);
    
    // Here you could integrate with OpenAI API:
    /*
    const openai = require('openai');
    const client = new openai.OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    
    const response = await client.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{
        role: "system",
        content: "Extract structured information from this resume text. Return JSON with fields: firstName, lastName, email, phone, skills (array), experience (string), education (string), currentJobTitle, currentCompany, location."
      }, {
        role: "user",
        content: basicData.rawContent
      }]
    });
    
    return JSON.parse(response.choices[0].message.content);
    */
    
    return basicData;
  } catch (error) {
    console.error('Error in AI resume parsing:', error);
    throw new Error(`Failed to parse resume with AI: ${error.message}`);
  }
}

module.exports = {
  upload,
  parseResume,
  parseResumeWithAI
};
