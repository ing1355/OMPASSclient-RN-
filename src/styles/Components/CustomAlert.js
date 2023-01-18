import { StyleSheet, Dimensions} from 'react-native';
import { RFPercentage } from 'react-native-responsive-fontsize';
import { NotoSansRegular } from '../../env';

const styles = StyleSheet.create({
    container: {
        flex: 10,
        backgroundColor: 'black',
    },
    modal_container: {
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
        height: 65,
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
    modal_content_text_container: {
        minHeight: 120,
        flexDirection: 'column',
        justifyContent: 'center'
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
        fontSize: RFPercentage(2.2), 
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
        fontSize: RFPercentage(2.2),
        fontFamily: NotoSansRegular,
        letterSpacing: -1,
    }
});

export default styles;