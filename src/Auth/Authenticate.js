import BioMetric from "./BioMetric";
import Pin from './Pin';
import Pattern from './Pattern'
import Face from "./Face";
import Fingerprint from "./Fingerprint";

export default function Authenticate(auth,callback, fidoAddress, username) {
    switch(auth) {
        case 'biometrics':
            return BioMetric({type: "인증", callback});
        case 'pattern':
            return Pattern({type: "인증", callback});
        case 'pin':
            return Pin({type: "인증", callback});
        case 'face':
            return Face({type: "인증", callback});
        case 'fingerprint':
            return Fingerprint({type: "인증", callback});
        default:
            return false;
    }
}