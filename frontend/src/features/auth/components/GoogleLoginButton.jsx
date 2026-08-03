import { GoogleLogin } from "@react-oauth/google"
import { loginGoogleUser } from "../api/auth"


export default function GoogleLoginButton({
    onSuccess,
    onError,
}) {
    const handleSuccess =
        async (
            credentialResponse,
        ) => {
            try {
                const credential =
                    credentialResponse
                        .credential

                if (!credential) {
                    throw new Error(
                        "Google 인증 토큰을 받지 못했습니다.",
                    )
                }

                const result =
                    await loginGoogleUser(
                        credential,
                    )

                onSuccess(result)
            } catch (error) {
                console.error(
                    "Google 로그인 오류:",
                    error,
                )

                onError(
                    error.message,
                )
            }
        }

    return (
        <GoogleLogin
            onSuccess={
                handleSuccess
            }
            onError={() =>
                onError(
                    "Google 로그인을 완료하지 못했습니다.",
                )
            }
            theme="outline"
            size="large"
            text="signin_with"
            shape="rectangular"
            locale="ko"
        />
    )
}