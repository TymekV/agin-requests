import { css, cva } from "@styled-system/css";

export const themeIconContainer = cva({
    base: {
        width: 'calc(var(--design-unit)* 4px + 2px)',
        height: 'calc(var(--design-unit)* 4px + 2px)',
        borderRadius: 'calc(var(--checkbox-corner-radius)* 1px)',
        // backgroundColor: 'color-mix(in srgb, var(--vscode-list-hoverBackground), var(--vscode-editor-background) 80%)',
        // color: 'var(--button-primary-background)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },
    variants: {
        iconColor: {
            green: {
                color: 'green.6',
                backgroundColor: 'dimmed.green.6',
            },
            red: {
                color: 'red.6',
                backgroundColor: 'dimmed.red.6',
            },
            blue: {
                color: 'blue.6',
                backgroundColor: 'dimmed.blue.6',
            },
            theme: {
                backgroundColor: 'color-mix(in srgb, var(--button-primary-background), var(--vscode-editor-background) 80%)',
                color: 'var(--button-primary-background)',
            }
        },
        clickable: {
            true: {
                cursor: 'pointer',
            }
        }
    }
});