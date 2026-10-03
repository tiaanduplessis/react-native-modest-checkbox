import * as React from 'react';
import { ImageSourcePropType, StyleSheet, Text } from 'react-native';
import Checkbox, { CheckboxProps, CheckboxChangeEvent, CheckboxCheckboxStyle, CheckboxContainerStyle, CheckboxLabelStyle } from 'react-native-modest-checkbox';

const styles = StyleSheet.create({
    box: { width: 25, height: 25, tintColor: 'blue' },
    container: { flexDirection: 'row', padding: 4 },
    label: { fontSize: 16, color: 'black' }
});
const box: CheckboxCheckboxStyle = [styles.box, false, null, undefined, [{ opacity: 0.5 }]];
const container: CheckboxContainerStyle = [styles.container, null];
const label: CheckboxLabelStyle = [styles.label, undefined];
const image: ImageSourcePropType = 1;
const props: CheckboxProps = {
    checked: false,
    checkedImage: image,
    uncheckedImage: { uri: 'https://example.com/unchecked.png' },
    checkboxStyle: box,
    containerStyle: container,
    labelStyle: label,
    label: 'Choice',
    customLabel: <Text>Choice</Text>,
    checkedComponent: <Text>Yes</Text>,
    uncheckedComponent: <Text>No</Text>,
    numberOfLabelLines: 2,
    labelBefore: true,
    noFeedback: true,
    disabled: true,
    onChange(event: CheckboxChangeEvent) {
        const checked: boolean = event.checked;
        const text: string = event.label;
        void checked;
        void text;
        // @ts-expect-error The runtime event contains label, not name.
        event.name;
    }
};
const ref = React.createRef<Checkbox>();
const full = <Checkbox {...props} ref={ref} />;
const minimal = <Checkbox />;
const nullComponents = <Checkbox customLabel={null} checkedComponent={null} uncheckedComponent={null} />;
const images = <Checkbox checkedImage={[{ uri: 'https://example.com/checked.png' }]} />;
const inferred = <Checkbox onChange={({ label, checked }) => {
    label.toUpperCase();
    checked.valueOf();
    // @ts-expect-error checked is boolean, not string.
    checked.toUpperCase();
}} />;
// @ts-expect-error checked accepts booleans only.
const badChecked = <Checkbox checked="yes" />;
// @ts-expect-error Image sources are registered assets or source objects, not strings.
const badImage = <Checkbox checkedImage="checked.png" />;
// @ts-expect-error The callback receives an event object, not a boolean.
const badCallback = <Checkbox onChange={(checked: boolean) => {}} />;
// @ts-expect-error Text-only styles do not belong on the image.
const badStyle = <Checkbox checkboxStyle={{ fontSize: 12 }} />;
// @ts-expect-error customLabel must be an element, not text.
const badLabel = <Checkbox customLabel="Choice" />;
void [full, minimal, nullComponents, images, inferred, badChecked, badImage, badCallback, badStyle, badLabel];
