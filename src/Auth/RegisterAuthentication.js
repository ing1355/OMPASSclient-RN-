import BioMetric from "./BioMetric";
import Pin from './Pin';
import Pattern from './Pattern'
import Face from './Face';
import Fingerprint from './Fingerprint';

export default function RegisterAuthentication(auth,callback, fidoAddress, username) {
    switch(auth) {
        case 'biometrics':
            return BioMetric({type: "등록", callback});
        case 'pattern':
            return Pattern({type: "등록", callback});
        case 'pin':
            return Pin({type: "등록", callback});
        case 'face':
            return Face({type: "등록", callback});
        case 'fingerprint':
            return Fingerprint({type: "등록", callback});
        default:
            return false;
    }
}