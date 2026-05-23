import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Returns a logout handler that clears all auth tokens before navigating.
 * Use this in every admin screen instead of bare navigation.replace('AdminLogin').
 */
const useAdminLogout = (navigation) => {
  return async () => {
    try {
      await AsyncStorage.multiRemove(['token', 'user', 'currentUser']);
    } catch (e) {
      console.warn('[AdminLogout] Failed to clear storage:', e.message);
    }
    navigation.replace('AdminLogin');
  };
};

export default useAdminLogout;
