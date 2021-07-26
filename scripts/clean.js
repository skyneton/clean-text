"use strict";
function TextCleaner(str) {
    const convertData = [];
    const quoteStack = [];
    let textOpen = 0;
    // while((str.match(/\r\r/g) || []).length > 0) str = str.replace(/\r\r/g, "\r");
    str = str.replace(/\r/g, "\n");
    const quoteOrTextOpenCheck = (c) => {
        if (["(", "{", "[", "‘", "“"].includes(c))
            textOpen++;
        else if ([")", "}", "]", "’", "”"].includes(c))
            textOpen--;
        else if (["\"", "'"].includes(c)) {
            if (quoteStack[quoteStack.length - 1] == c)
                quoteStack.pop();
            else
                quoteStack.push(c);
        }
    };
    const isKoChar = (c) => {
        const code = c.charCodeAt(0);
        return 4352 <= code && code <= 4607 || 12592 <= code && code <= 12687 || 44032 <= code && code <= 55203;
    };
    const isEnglishChar = (c) => {
        c = c.toLowerCase();
        return "a" <= c && c <= "z";
    };
    const hasFirstKoChar = (c) => {
        const firstCharId = Math.floor((c.charCodeAt(0) - 44032) / 588);
        return firstCharId >= 0 && firstCharId <= 18;
    };
    const isSpecialChar = (c) => {
        return ["!", "$", "%", "^", "&", "*", ":", ".", ",", "?", "/", "|"].includes(c);
    };
    const isSpecialEndChar = (c) => {
        return ["!", ".", "?"].includes(c);
    };
    const isQuoteChar = (c) => {
        return ["(", ")", "{", "}", "[", "]", "‘", "’", "“", "”", "\"", "'"].includes(c);
    };
    const isNotEndChar = (c) => {
        return isKoChar(c) && hasFirstKoChar(c) || isEnglishChar(c) || isSpecialChar(c) && !isQuoteChar(c) && c == ",";
    };
    for (let i = 0; i < str.length; i++) {
        const c = str.charAt(i);
        const nextC = str.charAt(i + 1);
        const lastC = convertData[convertData.length - 1] || "";
        quoteOrTextOpenCheck(c);
        if (c == " " && nextC == "\n")
            continue;
        if ((textOpen > 0 || quoteStack.length > 0) && c == "\n") {
            if (nextC != "" && (![")", "}", "]", "’", "”", " "].includes(nextC) || ["\"", "'"].includes(nextC) && quoteStack[quoteStack.length - 1] != nextC) && lastC != " ")
                convertData.push(" ");
            continue;
        }
        if ((textOpen > 0 || quoteStack.length > 0) && c == " " && nextC != "" && ([")", "}", "]", "’", "”", " "].includes(nextC) || ["\"", "'"].includes(nextC) && quoteStack[quoteStack.length - 1] == nextC))
            continue;
        // if(nextC != "" && (isSpecialChar(c) || isKoChar(c) && !hasFirstKoChar(c)) && nextC != "\n" && !(isQuoteChar(nextC) || isSpecialChar(c) && isSpecialChar(nextC) || isKoChar(c) && !hasFirstKoChar(c) && isKoChar(c) && !hasFirstKoChar(nextC))) {
        if (nextC != "" && isSpecialChar(c) && nextC != "\n") {
            convertData.push(c);
            if (!(textOpen > 0 || quoteStack.length > 0) && isSpecialEndChar(c) && c != "\n")
                convertData.push("\n");
            else if (c != " " && nextC != " ")
                convertData.push(" ");
            continue;
        }
        if (lastC != "" && isNotEndChar(lastC) && (c == " " && nextC == "\n" || c == "\n") && !(isKoChar(lastC) && isEnglishChar(nextC) || isEnglishChar(lastC) && isKoChar(nextC)) && (!isKoChar(lastC) || hasFirstKoChar(lastC))) {
            if ((["은", "는", "이", "가", "을", "를", "고", "기", "아", "의", "에", "만", "지", "로", "과", "던", "서", "해", "럼"].includes(lastC) || isEnglishChar(lastC)) && !isQuoteChar(nextC))
                convertData.push(" ");
            while (["\n", " "].includes(str.charAt(++i)))
                ;
            i--;
            continue;
        }
        convertData.push(c);
    }
    return new class {
        toBlob() {
            return new Blob(convertData, { type: "text/plain" });
        }
    };
}
