import { MutableRefObject } from "react";
import {CustomModalRef} from "./RefPopup";

export default class FinishPopup {
    static modalRef: MutableRefObject<CustomModalRef | undefined>;
    static setRef = (ref:  MutableRefObject<CustomModalRef | undefined>) => {
        this.modalRef = ref
    }

    static show = (title: string, message: string) => {
        this.modalRef.current?.show(title, message)
    }

    static hide = () => {
        this.modalRef.current?.hide()
    }
}