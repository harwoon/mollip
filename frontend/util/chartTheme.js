function getCssVariable(variableName, fallback = "") {
    if (typeof window === "undefined") {
        return fallback
    }

    const value = getComputedStyle(
        document.documentElement
    ).getPropertyValue(variableName)

    return value.trim() || fallback
}

function getCssNumber(variableName, fallback = 0) {
    const value = getCssVariable(
        variableName,
        String(fallback)
    )

    const numberValue = Number(value)

    return Number.isNaN(numberValue)
        ? fallback
        : numberValue
}

export function getChartTheme() {
    return {
        colors: {
            primary: getCssVariable(
                "--chart-primary",
                "#7653b8"
            ),

            primarySoft: getCssVariable(
                "--chart-primary-soft",
                "#baa3dd"
            ),

            primaryLight: getCssVariable(
                "--chart-primary-light",
                "#eee6fb"
            ),

            secondary: getCssVariable(
                "--chart-secondary",
                "#d9a7d2"
            ),

            secondarySoft: getCssVariable(
                "--chart-secondary-soft",
                "#efd3eb"
            ),

            success: getCssVariable(
                "--chart-success",
                "#87cdb1"
            ),

            warning: getCssVariable(
                "--chart-warning",
                "#f2c992"
            ),

            danger: getCssVariable(
                "--chart-danger",
                "#ef9a9f"
            ),

            grid: getCssVariable(
                "--chart-grid",
                "#dddddd"
            ),

            axis: getCssVariable(
                "--chart-axis",
                "#888888"
            ),

            axisStrong: getCssVariable(
                "--chart-axis-strong",
                "#555555"
            ),

            cursor: getCssVariable(
                "--chart-cursor",
                "#f4f0fa"
            ),

            referenceLine: getCssVariable(
                "--chart-reference-line",
                "#bbbbbb"
            ),

            palette: [
                getCssVariable(
                    "--chart-color-1",
                    "#9f83ce"
                ),
                getCssVariable(
                    "--chart-color-2",
                    "#e7bedf"
                ),
                getCssVariable(
                    "--chart-color-3",
                    "#f5d2aa"
                ),
                getCssVariable(
                    "--chart-color-4",
                    "#afe7d3"
                ),
                getCssVariable(
                    "--chart-color-5",
                    "#c9ddfa"
                )
            ]
        },

        fontSizes: {
            xs: getCssNumber(
                "--chart-font-xs",
                10
            ),

            sm: getCssNumber(
                "--chart-font-sm",
                11
            ),

            md: getCssNumber(
                "--chart-font-md",
                12
            ),

            lg: getCssNumber(
                "--chart-font-lg",
                13
            )
        },

        sizes: {
            lineWidth: getCssNumber(
                "--chart-line-width",
                2
            ),

            dotRadius: getCssNumber(
                "--chart-dot-radius",
                5
            ),

            barSize: getCssNumber(
                "--chart-bar-size",
                24
            ),

            barRadius: getCssNumber(
                "--chart-bar-radius",
                4
            )
        }
    }
}