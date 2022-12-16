import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    toggle_container: {
        position:'relative',
        borderRadius: 15,
        width: 34,
        height: 18
    },
    toggle_bar: {
        left: -1,
        position: 'absolute',
        top: -2,
        width: 22,
        height: 22,
        backgroundColor:'white',
        borderWidth: 1,
        borderRadius: 20
    }
});

export default styles;