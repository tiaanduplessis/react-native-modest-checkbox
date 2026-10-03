import * as React from 'react';
import { ImageSourcePropType, ImageStyle, StyleProp, TextStyle, ViewStyle } from 'react-native';

export type CheckboxCheckboxStyle = StyleProp<ImageStyle>;
export type CheckboxContainerStyle = StyleProp<ViewStyle>;
export type CheckboxLabelStyle = StyleProp<TextStyle>;

export interface CheckboxChangeEvent {
    label: string;
    checked: boolean;
}

export interface CheckboxProps {
    checkedComponent?: React.ReactElement | null;
    uncheckedComponent?: React.ReactElement | null;
    checked?: boolean;
    checkedImage?: ImageSourcePropType;
    uncheckedImage?: ImageSourcePropType;
    checkboxStyle?: CheckboxCheckboxStyle;
    containerStyle?: CheckboxContainerStyle;
    label?: string;
    customLabel?: React.ReactElement | null;
    labelBefore?: boolean;
    labelStyle?: CheckboxLabelStyle;
    numberOfLabelLines?: number;
    onChange?: (event: CheckboxChangeEvent) => void;
    noFeedback?: boolean;
    disabled?: boolean;
}

export default class Checkbox extends React.PureComponent<CheckboxProps> {}
