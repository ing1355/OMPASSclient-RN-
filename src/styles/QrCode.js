import { StyleSheet } from 'react-native';
import { RFPercentage } from 'react-native-responsive-fontsize';
import { NotoSansRegular } from '../env';

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    qr_text: {
        position:'absolute',
        textAlign:'center',
        color: 'white', 
        alignSelf: 'center', 
        fontSize: RFPercentage(3),
        fontFamily: 'NotoSans-Bold', 
        letterSpacing: -1,
        top:'18%',
        zIndex: 3
    },
    qr_square: {
        flex: 2.9,
        height:'100%'
    },
    modal_content_text_container: {
        flex: 0.4,
        paddingBottom: RFPercentage(2),
        flexDirection: 'row',
        marginBottom:RFPercentage(0.5)
    },
    modal_content_text: {
        fontFamily:'NotoSans-Bold',
        color: '#666666',
        flex: 0.3,
        textAlign:'right',
        paddingRight: 5,
        height:RFPercentage(6),
        letterSpacing: -1,
        fontSize: RFPercentage(1.9),
    },
    modal_content_colon: {
        fontFamily:'NotoSans-Bold',
        color: '#666666',
        height:RFPercentage(6),
        width: 10,
        fontSize: RFPercentage(2),
    },
    modal_content_value: {
        fontFamily:NotoSansRegular,
        color: '#666666',
        flex: 1,
        height: RFPercentage(6),
        textAlignVertical:'top',
        letterSpacing: -1,
        fontSize: RFPercentage(2)
    },
    modal_msg: {
        fontSize: RFPercentage(2),
        textAlignVertical: 'center',
        textAlign: 'center',
        fontFamily:NotoSansRegular,
        letterSpacing: -1
    },
    qr_masking: {
        // backgroundColor: 'rgba(0,0,0,.2)',
    }
});

export default styles;