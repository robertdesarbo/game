import {ImgHTMLAttributes} from 'react';
import logo from '../../images/logo-v2.png'

export default function ApplicationLogo(props: ImgHTMLAttributes<any>) {
    return (
        <img {...props} src={logo} />
    );
}
