import React from 'react';
import {StyleSheet, Platform} from 'react-native';
import {RFPercentage} from 'react-native-responsive-fontsize';
import {NotoSansRegular} from '../env';

const tooltipBackground = '#9cd3fb';

const styles = StyleSheet.create({
  title: {
    flex: 2,
    justifyContent: 'center',
  },
  title_text: {
    alignSelf: 'center',
    fontSize: RFPercentage(5),
  },
  contents: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  container: {
    flex: 1,
  },
  ompass_logo: {
    width: '40%',
    height: '40%',
    alignSelf: 'center',
  },
  mark: {
    width: '80%',
    height: '80%',
    alignSelf: 'center',
  },
  center_text: {
    flex: 1,
    textAlign: 'center',
    textDecorationLine: 'underline',
    textDecorationColor: 'white',
    color: 'white',
    fontSize: RFPercentage(2.5),
  },
  btn_container: {
    flex: 0.5,
    width: '70%',
    alignSelf: 'center',
    marginVertical: '2%',
    backgroundColor: 'white',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btn: {
    width: '100%',
    height: '100%',
    alignSelf: 'center',
  },
  btn_text: {
    fontFamily: 'NotoSans-Bold',
    textAlign: 'center',
    fontSize: RFPercentage(2),
    textAlignVertical: 'center',
    letterSpacing: -1.2,
    color: '#3671d7',
  },
  qr_text_container: {
    width: '25%',
    alignSelf: 'center',
    height: '3%',
    marginBottom: '20%',
    fontWeight: '900',
  },
  qr_text: {
    textDecorationColor: 'white',
    fontFamily: 'NotoSans-Bold',
    color: '#ffffff',
    textDecorationLine: 'underline',
    fontSize: RFPercentage(2),
    textAlignVertical: 'center',
    textAlign: 'center',
  },
  modal_msg: {
    fontSize: RFPercentage(2),
    textAlignVertical: 'center',
    textAlign: 'center',
    fontFamily: NotoSansRegular,
    letterSpacing: -1,
  },
  menu_btn: {
    position: 'absolute',
    right: 5,
    top: 5,
    width: 80,
    height: 80,
    zIndex: 1,
    alignItems:'center',
    justifyContent:'center',
  },
  qr_navigate: {
    position: 'relative',
    width: RFPercentage(14),
    height: RFPercentage(14),
    alignSelf: 'center',
    justifyContent: 'center',
  },
  qr_animate: {
    flex: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.58,
    shadowRadius: 16,
    elevation: 24,
    borderRadius: RFPercentage(9),
    justifyContent: 'center',
    backgroundColor: 'white',
  },
  qr_tooltip: {
    position: 'absolute',
    zIndex: 1,
    alignSelf:'center',
    top: '-85%',
    height: '50%',
    width: '250%',
  },
  qr_tooltip_arrow: {
    position: 'absolute',
    // backgroundColor: tooltipBackground,
    width: 1,
    height: 1,
    borderWidth: 15,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: 'transparent',
    borderTopColor: tooltipBackground,
    top: '99.9%',
    alignSelf:'center',
    zIndex: 1,
  },
  qr_tooltip_text: {
    textAlign: 'center',
    position: 'relative',
    zIndex: 2,
    width: '100%',
    height: '100%',
    paddingTop: Platform.OS === 'android' ? '2.5%' : '4%',
    backgroundColor: tooltipBackground,
    borderRadius: 15,
    overflow:'hidden',
    color: '#265599'
  },
});

export default styles;
