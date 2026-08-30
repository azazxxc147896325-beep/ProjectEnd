import * as SecureStore from 'expo-secure-store';

const KEY_REMEMBER_ME = 'campus_food_remember_me';
const KEY_SAVED_EMAIL = 'campus_food_saved_email';
const KEY_SAVED_PASSWORD = 'campus_food_saved_password';

export interface SavedCredentials {
  rememberMe: boolean;
  email: string;
  password: string;
}

/**
 * ดึงข้อมูลอีเมล/รหัสผ่านที่บันทึกไว้จาก SecureStore
 */
export async function getSavedCredentials(): Promise<SavedCredentials> {
  try {
    const rememberMeVal = await SecureStore.getItemAsync(KEY_REMEMBER_ME);
    const rememberMe = rememberMeVal === 'true';

    if (!rememberMe) {
      // ดึง email เผื่อไว้แสดงผล แม้ไม่ได้จำรหัสผ่าน
      const email = (await SecureStore.getItemAsync(KEY_SAVED_EMAIL)) || '';
      return { rememberMe: false, email, password: '' };
    }

    const email = (await SecureStore.getItemAsync(KEY_SAVED_EMAIL)) || '';
    const password = (await SecureStore.getItemAsync(KEY_SAVED_PASSWORD)) || '';

    return {
      rememberMe: true,
      email,
      password,
    };
  } catch (error) {
    console.warn('[SecureStore] Failed to read saved credentials:', error);
    return { rememberMe: false, email: '', password: '' };
  }
}

/**
 * บันทึกหรือลบข้อมูลรหัสผ่านตามสถานะ Remember Me
 */
export async function saveCredentials(
  email: string,
  password: string,
  rememberMe: boolean,
): Promise<void> {
  try {
    if (rememberMe) {
      await SecureStore.setItemAsync(KEY_REMEMBER_ME, 'true');
      await SecureStore.setItemAsync(KEY_SAVED_EMAIL, email.trim());
      await SecureStore.setItemAsync(KEY_SAVED_PASSWORD, password);
    } else {
      await SecureStore.setItemAsync(KEY_REMEMBER_ME, 'false');
      await SecureStore.deleteItemAsync(KEY_SAVED_PASSWORD);
      // ยังคงเก็บ email ล่าสุดไว้เพื่อความสะดวก
      if (email.trim()) {
        await SecureStore.setItemAsync(KEY_SAVED_EMAIL, email.trim());
      }
    }
  } catch (error) {
    console.warn('[SecureStore] Failed to save credentials:', error);
  }
}

/**
 * ล้างข้อมูลที่จดจำไว้ทั้งหมด
 */
export async function clearSavedCredentials(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(KEY_REMEMBER_ME);
    await SecureStore.deleteItemAsync(KEY_SAVED_EMAIL);
    await SecureStore.deleteItemAsync(KEY_SAVED_PASSWORD);
  } catch (error) {
    console.warn('[SecureStore] Failed to clear credentials:', error);
  }
}
