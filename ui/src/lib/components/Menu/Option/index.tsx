import { IconCheck, TablerIcon } from '@tabler/icons-react';
import { optionLabel, optionLeft, optionStyles } from './styles';
import { token } from '@styled-system/tokens';

type OptionVariants = Exclude<Parameters<typeof optionStyles>[0], undefined>;
export interface OptionProps extends React.HTMLAttributes<HTMLDivElement>, OptionVariants {
    label: string,
    value: string,
    icon?: TablerIcon,
    description?: string,
    selected?: boolean;
}

export function Option({ label, value, icon: Icon, description, optionColor, selected, ...props }: OptionProps) {
    return (
        <div className={optionStyles({ optionColor })} {...props}>
            <div className={optionLeft}>
                {Icon && <Icon size={18} color={optionColor ? token(optionColor as any) : "color-mix(in srgb, var(--vscode-foreground), black 50%)"} />}
                <div className={optionLabel}>
                    {label}
                </div>
            </div>
            {selected && <IconCheck size={14} />}
        </div>
    )
}