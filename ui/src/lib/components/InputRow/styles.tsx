import { css } from "@styled-system/css";

export const param = css({
    display: 'flex',
    gap: '10px',
    padding: '5px 10px',
    borderRadius: '10px',
    transition: 'background-color .3s ease',
    alignItems: 'center',
    '&:hover,&:focus-within': {
        backgroundColor: 'var(--vscode-list-hoverBackground)'
    },
});

export const labelStyles = css({
    fontSize: 14,
    fontWeight: 600,
    width: '80px'
});