declare module 'react-native-modest-checkbox' {
    import * as React from 'react';

    export type CheckboxCheckboxStyle = any[] | Object;

    export type CheckboxContainerStyle = any[] | Object;

    export type CheckboxLabelStyle = any[] | Object;

    export interface CheckboxProps {
        checkedComponent?: React.ReactElement<any>;
        uncheckedComponent?: React.ReactElement<any>;
        checked?: boolean;
        checkboxStyle?: CheckboxCheckboxStyle;
        containerStyle?: CheckboxContainerStyle;
        label?: string;
        customLabel?: React.ReactElement<any>;
        labelBefore?: boolean;
        labelStyle?: CheckboxLabelStyle;
        numberOfLabelLines?: number;
        onChange?: (...args: any[])=>any;
        noFeedback?: boolean;
        disabled?: boolean;
    }

    export default class Checkbox extends React.PureComponent<CheckboxProps, any> {
        render(): JSX.Element;

    }

}
