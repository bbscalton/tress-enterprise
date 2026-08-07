import {
  GoogleAuthProvider,
  getRedirectResult,
  signInWithPopup,
  signInWithRedirect,
  type Auth,
} from 'firebase/auth';

function shouldUseRedirect(): boolean {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent;
  const isMobile = /Android|iPhone|iPad|iPod/i.test(ua);
  const isWebView = /wv|WebView/i.test(ua);
  const isCapacitor = typeof (window as unknown as { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor?.isNativePlatform === 'function' &&
    (window as unknown as { Capacitor: { isNativePlatform: () => boolean } }).Capacitor.isNativePlatform();
  return isCapacitor || isWebView || isMobile;
}

export async function completeGoogleRedirect(auth: Auth) {
  try {
    return await getRedirectResult(auth);
  } catch (e) {
    console.error('Redirect sign-in error', e);
    return null;
  }
}

export async function signInWithGoogle(auth: Auth) {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });

  if (shouldUseRedirect()) {
    await signInWithRedirect(auth, provider);
    return;
  }

  try {
    await signInWithPopup(auth, provider);
  } catch (e: unknown) {
    const code = (e as { code?: string })?.code;
    if (code === 'auth/popup-blocked' || code === 'auth/popup-closed-by-user') {
      await signInWithRedirect(auth, provider);
      return;
    }
    throw e;
  }
}
