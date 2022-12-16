import { StyleSheet, Dimensions} from 'react-native';
import { RFPercentage } from 'react-native-responsive-fontsize';
import { NotoSansRegular } from '../../env';

const styles = StyleSheet.create({
    container: {
        flex: 10,
        backgroundColor: 'black',
    },
    modal_container: {
        flex: 1,
        position:'absolute',
        width: Dimensions.get('window').width,
        height:Dimensions.get('window').height,
        alignSelf:'center',
        flexDirection: 'column',
        justifyContent: 'center',
        backgroundColor: 'rgba(51, 51, 51, 0.3)'
    },
    modal_box_container: {
        alignSelf: 'center',
        width: '80%',
        borderRadius: 15,
        backgroundColor: 'white',
        overflow: 'hidden'
    },
    modal_title_container: {
        flex: 1,
        flexDirection: 'column',
        alignItems:'center',
        justifyContent: 'center',
        borderBottomWidth: 0.5,
        borderBottomColor: 'gray'
    },
    modal_title_text: {
        textAlign: 'center',
        fontFamily: NotoSansRegular,
        letterSpacing: -1,
    },
    btn_text: {
        color: 'white',
        fontSize: RFPercentage(3),
        textAlign: 'center',
        textAlignVertical: 'center',
        fontWeight: 'bold'
    },
    centeredView: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 22
    },
    modal_content_text_container: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'center',
    },
    modal_content_text: {
        color: 'black',
        flex: 0.5
    },
    modal_content_colon: {
        color: 'gray',
        flex: 0.1
    },
    modal_content_value: {
        color: 'gray',
        flex: 1
    },
    cancel_container: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems:'center',
        backgroundColor: '#666666'
    },
    cancel_text: {
        textAlign: 'center', 
        textAlignVertical: 'center', 
        color: '#ffffff', 
        fontSize: RFPercentage(2), 
        fontFamily: NotoSansRegular, 
        letterSpacing: -1,
    },
    confirm_container: {
        flex: 1,
        flexDirection: 'row', 
        justifyContent: 'center', 
        alignItems:'center',
        backgroundColor: '#359fef'
    },
    confirm_text: {
        textAlign: 'center',
        textAlignVertical: 'center',
        color: 'white',
        fontSize: RFPercentage(2),
        fontFamily: NotoSansRegular,
        letterSpacing: -1,
    }
});

export default styles;