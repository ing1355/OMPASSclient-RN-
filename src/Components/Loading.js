import React from 'react';
import Spinner from 'react-native-loading-spinner-overlay';
import { connect } from 'react-redux';

const Loading = ({isLoading, children}) => {
    return <>
        <Spinner visible={isLoading}/>
        {children}
    </>
}


function mapStateToProps(state) {
    return {
      isLoading: state.isLoading
    };
  }
  
  function mapDispatchToProps(dispatch) {
    return {
    };
  }
  
  export default connect(mapStateToProps, mapDispatchToProps)(Loading);