import {
    useEffect,
    useRef,
} from "react"

import {
    useGoogleOAuth,
} from "@react-oauth/google"

import {
    loginGoogleUser,
} from "../api/auth"

const GSI_STATE_KEY =
    "__MOLLIP_GOOGLE_IDENTITY_STATE__"

function getGoogleIdentityState() {
    if (!window[GSI_STATE_KEY]) {
        window[GSI_STATE_KEY] = {
            initialized: false,
            clientId: null,
            credentialHandler: null,
        }
    }

    return window[GSI_STATE_KEY]
}

export default function GoogleLoginButton({
    onSuccess,
    onError,
}) {
    const buttonRef = useRef(null)

    const {
        clientId,
        scriptLoadedSuccessfully,
    } = useGoogleOAuth()

    const successHandlerRef =
        useRef(null)

    successHandlerRef.current =
        async (credentialResponse) => {
            try {
                const credential =
                    credentialResponse
                        ?.credential

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
                    error.message ||
                    "Google 로그인에 실패했습니다.",
                )
            }
        }

    useEffect(() => {
        if (
            !scriptLoadedSuccessfully ||
            !window.google ||
            !buttonRef.current
        ) {
            return
        }

        const googleIdentity =
            window.google.accounts.id

        const state =
            getGoogleIdentityState()

        // 현재 마운트된 컴포넌트의 성공 함수 등록
        state.credentialHandler =
            (credentialResponse) => {
                successHandlerRef.current?.(
                    credentialResponse,
                )
            }

        // 한 페이지에서 딱 한 번만 초기화
        if (!state.initialized) {
            googleIdentity.initialize({
                client_id: clientId,

                callback:
                    (credentialResponse) => {
                        const currentState =
                            getGoogleIdentityState()

                        currentState
                            .credentialHandler?.(
                                credentialResponse,
                            )
                    },

                auto_select: false,

                // Chrome의 브라우저 기반 로그인 UI 사용
                use_fedcm_for_button: true,
                button_auto_select: false,
            })

            state.initialized = true
            state.clientId = clientId
        } else if (
            state.clientId !== clientId
        ) {
            console.error(
                "Google Client ID가 실행 중 변경되었습니다.",
            )

            return
        }

        // 로그인 페이지가 다시 열릴 때
        // initialize는 하지 않고 버튼만 다시 그림
        buttonRef.current.replaceChildren()

        googleIdentity.renderButton(
            buttonRef.current,
            {
                type: "standard",
                theme: "outline",
                size: "large",
                text: "signin_with",
                shape: "rectangular",
                logo_alignment: "left",
                locale: "ko",
            },
        )

        return () => {
            const currentState =
                getGoogleIdentityState()

            currentState.credentialHandler =
                null
        }
    }, [
        clientId,
        scriptLoadedSuccessfully,
    ])

    return (
        <div
            ref={buttonRef}
            style={{
                minHeight: "40px",
            }}
        />
    )
}