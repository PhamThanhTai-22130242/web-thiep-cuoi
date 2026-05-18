import { GoogleLogin } from '@react-oauth/google';
import { AuthUser } from '../models/auth.model';
import { authService } from '../services/auth.service';
import { authTokenService } from '../services/auth-token.service';
import { ApiError } from '../services/http.service';

type GoogleLoginButtonProps = {
    disabled?: boolean;
    onStart?: () => void;
    onSuccess: (user: AuthUser | null) => void;
    onError: (message: string) => void;
    onSettled?: () => void;
};

function GoogleLoginButton({ disabled = false, onStart, onSuccess, onError, onSettled }: GoogleLoginButtonProps) {
    const handleGoogleSuccess = async (credentialResponse: { credential?: string }) => {
        if (!credentialResponse.credential) {
            onError('Google không trả về mã đăng nhập. Vui lòng thử lại.');
            return;
        }

        onStart?.();

        try {
            const loginResponse = await authService.loginWithGoogle({ idToken: credentialResponse.credential });
            const loggedInUser = loginResponse.data?.user ?? authTokenService.getUser();

            onSuccess(loggedInUser);
        } catch (error) {
            onError(error instanceof ApiError ? error.message : 'Đăng nhập Google thất bại. Vui lòng thử lại.');
        } finally {
            onSettled?.();
        }
    };

    return (
        <div className={`home-google-auth-provider${disabled ? ' is-disabled' : ''}`}>
            <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => onError('Đăng nhập Google thất bại. Vui lòng thử lại.')}
                shape="pill"
                size="large"
                text="continue_with"
                theme="outline"
                width="260"
            />
        </div>
    );
}

export default GoogleLoginButton;
