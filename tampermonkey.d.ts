/**
 * Type definitions for Tampermonkey script options
 */

/**
 * Enumeration of available @grant options for Tampermonkey scripts.
 */
declare enum TampermonkeyGrant {
    /**
     * No special privileges required.
     */
    NONE = 'none',
    /**
     * Allows injecting CSS styles into the page using GM_addStyle.
     */
    GM_ADDSTYLE = 'GM_addStyle',
    /**
     * Allows deleting a stored value using GM_deleteValue.
     */
    GM_DELETEVALUE = 'GM_deleteValue',
    /**
     * Allows fetching the text content of resources (files) within the script using GM_getResourceText.
     */
    GM_GETRESOURCETEXT = 'GM_getResourceText',
    /**
     * Allows fetching the URL of resources (files) within the script using GM_getResourceURL.
     */
    GM_GETRESOURCEURL = 'GM_getResourceURL',
    /**
     * Allows retrieving stored values using GM_getValue.
     */
    GM_GETVALUE = 'GM_getValue',
    /**
     * Allows logging messages using GM_log.
     */
    GM_LOG = 'GM_log',
    /**
     * Allows displaying notifications using GM_notification.
     */
    GM_NOTIFICATION = 'GM_notification',
    /**
     * Allows opening tabs using GM_openInTab.
     */
    GM_OPENINTAB = 'GM_openInTab',
    /**
     * Allows registering menu commands using GM_registerMenuCommand.
     */
    GM_REGISTERMENUCOMMAND = 'GM_registerMenuCommand',
    /**
     * Allows setting the content of the clipboard using GM_setClipboard.
     */
    GM_SETCLIPBOARD = 'GM_setClipboard',
    /**
     * Allows storing values using GM_setValue.
     */
    GM_SETVALUE = 'GM_setValue',
    /**
     * Allows making cross-origin XMLHttpRequests using GM_xmlhttpRequest.
     */
    GM_XMLHTTPREQUEST = 'GM_xmlhttpRequest',
    /**
     * Grants full access to the page's JavaScript context (window object).
     * Use with caution as it can lead to security vulnerabilities.
     */
    UNSAFEWINDOW = 'unsafeWindow'
}

/**
 * Options for Tampermonkey scripts.
 */
interface TampermonkeyOptions {
    /**
     * The name of the script.
     */
    name: string;
    /**
     * The namespace of the script. Usually a URL.
     */
    namespace: string;
    /**
     * The version of the script.
     */
    version: string;
    /**
     * A brief description of the script.
     */
    description: string;
    /**
     * The author of the script.
     */
    author: string;
    /**
     * An array of URLs to match against for running the script.
     */
    match: string[];
    /**
     * The special privileges required by the script.
     */
    grant: TampermonkeyGrant;
}

/**
 * Registers a new Tampermonkey script.
 * @param options Options for the Tampermonkey script.
 */
declare function GM_registerScript(options: TampermonkeyOptions): void;
