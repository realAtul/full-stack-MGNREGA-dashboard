import React from "react";
import { strings } from "../i18n";

const OfflineNotice = ({ lang }) => {
    return (
        <div className="offline-notice">
            <div className="offline-icon">⚠️</div>
            <div className="offline-message">{strings[lang].offlineMessage}</div>
        </div>
    );
};

export default OfflineNotice;
