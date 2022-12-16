import { StyleSheet, Dimensions, Platform,  } from 'react-native';
import { RFPercentage } from 'react-native-responsive-fontsize';
import { NotoSansRegular } from '../../env';

const deviceWidth = Dimensions.get('screen').width;
const deviceHeight = Dimensions.get('screen').height;

const styles = StyleSheet.create({
    container: {
        flex: 10,
        paddingHorizontal: Platform.OS === 'android' ? 0 : '4%',
        backgroundColor:'rgba(248,248,248,1)'
    },
    title: {
        flex: 1,
        backgroundColor: 'red',
        flexDirection: 'row',
        alignItems: 'center'
    },
    sub_title: {
        flex: 0.1,
        flexDirection: 'row',
        alignItems: 'center',
        minHeight: '8%',
        backgroundColor: 'rgba(147,215,255,0.2)',
        width: '100%'
    },
    sub_title_text: {
        paddingHorizontal: '5%',
        letterSpacing: -1,
        fontFamily: NotoSansRegular,
        textAlign:'center',
        width: '100%',
    },
    content_container: { 
        marginVertical: '5%',
        backgroundColor:'white',
        borderRadius: 25
    },
    cancel_button: {
        alignSelf: 'flex-end',
        flex: 1,
        backgroundColor: 'green'
    },
    title_text: {
        flex: 1,
        textAlign: 'center'
    },
    init_button: {
        flex: 5,
        borderWidth: 0.6,
        flexDirection: 'column',
        justifyContent: 'center'
    },
    icon: {
        alignSelf: 'center',
        width: 20,
        marginRight: 5
    },
    notice_container: {
        height: 200,
        paddingHorizontal: '5%',
        paddingVertical: '5%',
        borderRadius: 25,
        backgroundColor:'rgba(218,232,248,.5)'
    },
    notice_contents_container: {
        flex: 1, 
        paddingHorizontal: '4%', 
        flexDirection: 'row',
    },
    notice_contents: {
        color: '#666666',
        fontFamily: NotoSansRegular,
        letterSpacing: -1,
        fontSize: RFPercentage(1.8)
    },
    btn_container: {
        width: '25%',
        height: 40,
        alignSelf: 'center',
        borderWidth: 1,
        borderColor: '#dddddd',
        flexDirection: 'column',
        justifyContent: 'center'
    },
    btn_text: {
        textAlignVertical: 'center',
        textAlign: 'center',
        fontFamily: NotoSansRegular,
        letterSpacing: -1
    },
    modal_msg: {
        fontSize: RFPercentage(1.8),
        textAlignVertical: 'center',
        textAlign: 'center',
        fontFamily:NotoSansRegular,
        letterSpacing: -1
    },
    notice_title : {
        flex: 12, 
        textAlignVertical: 'center',
        alignSelf:'center',
        fontSize: RFPercentage(2.3),
        fontFamily: NotoSansRegular, 
        letterSpacing: -1,
    }
});

export default styles;