function TextCleaner(str: string) {
    const convertData:string[] = [];
    const quoteStack:string[] = [];
    let textOpen = 0;

    // while((str.match(/\r\r/g) || []).length > 0) str = str.replace(/\r\r/g, "\r");
    str = str.replace(/\r\n/g, "\n");
    str = str.replace(/\r/g, "\n");

    const quoteOrTextOpenCheck = (c: string) => {
        if(["(", "{", "[", "‘", "“"].includes(c)) textOpen++;
        else if([")", "}", "]", "’", "”"].includes(c)) textOpen--;
        else if(["\"", "'"].includes(c)) {
            if(quoteStack[quoteStack.length - 1] == c) quoteStack.pop();
            else quoteStack.push(c);
        }
    }

    const isKoChar = (c: string) => {
        const code = c.charCodeAt(0);
        return 4352 <= code && code <= 4607 || 12592 <= code && code <= 12687 || 44032 <= code && code <= 55203;
    }

    const isEnglishChar = (c: string) => {
        c = c.toLowerCase();
        return "a" <= c && c <= "z";
    }

    const hasFirstKoChar = (c: string) => {
        const firstCharId = Math.floor((c.charCodeAt(0) - 44032)/588);
        return firstCharId >= 0 && firstCharId <= 18;
    }

    const isSpecialChar = (c: string) => {
        return ["!", "$", "%", "^", "&", "*", ":", ".", ",", "?", "/", "|"].includes(c);
    };

    const isSpecialEndChar = (c: string) => {
        return ["!", ".", "?"].includes(c);
    };

    const isNumber = (c: string) => {
        return "0" <= c && c <= "9";
    }

    const isQuoteChar = (c: string) => {
        return ["(", ")", "{", "}", "[", "]", "‘", "’", "“", "”", "\"", "'"].includes(c);
    }

    const isNotEndChar = (c: string) => {
        return isKoChar(c) && hasFirstKoChar(c) || isEnglishChar(c) || isSpecialChar(c) && !isQuoteChar(c) && c == ",";
    }

    for(let i = 0; i < str.length; i++) {
        const llC = convertData[convertData.length - 2] || "";
        const lastC = convertData[convertData.length - 1] || "";
        const c = str.charAt(i);
        const nextC = str.charAt(i+1);
        const nnC = str.charAt(i+2);
        quoteOrTextOpenCheck(c);

        if(c == " " && nextC == "\n") continue;

        if((textOpen > 0 || quoteStack.length > 0) && c == "\n") {
            if(nextC != "" && (![")", "}", "]", "’", "”", " "].includes(nextC) || ["\"", "'"].includes(nextC) && quoteStack[quoteStack.length - 1] != nextC) && lastC != " ") convertData.push(" ");
            continue;
        }
        if((textOpen > 0 || quoteStack.length > 0) && c == " " && nextC != "" && ([")", "}", "]", "’", "”", " "].includes(nextC) || ["\"", "'"].includes(nextC) && quoteStack[quoteStack.length - 1] == nextC)) continue;

        // if(nextC != "" && (isSpecialChar(c) || isKoChar(c) && !hasFirstKoChar(c)) && nextC != "\n" && !(isQuoteChar(nextC) || isSpecialChar(c) && isSpecialChar(nextC) || isKoChar(c) && !hasFirstKoChar(c) && isKoChar(c) && !hasFirstKoChar(nextC))) {
        if(nextC != "" && isSpecialChar(c) && nextC != "\n") {
            convertData.push(c);
            if(!(textOpen > 0 || quoteStack.length > 0) && isSpecialEndChar(c) && c != "\n" && c != " " && !isSpecialChar(nextC) && !isNumber(nextC) && nextC != " ") {
                convertData.push("\n");
            }
            else if(c != " " && nextC != " " && !isSpecialChar(nextC) && !isQuoteChar(nextC)) convertData.push(" ");
            continue;
        }

        if(lastC != "" && isNotEndChar(lastC) && (lastC != " " && c == " " && nextC == "\n" && nnC != "\n" || (lastC != " " || llC != " ") && c == "\n" && nextC != "\n") && !(isKoChar(lastC) && isEnglishChar(nextC) || isEnglishChar(lastC) && isKoChar(nextC)) && (!isKoChar(lastC) || hasFirstKoChar(lastC))) {
            if ((["은", "는", "이", "가", "을", "를", "고", "기", "아", "의", "에", "만", "지", "로", "과", "던", "서", "해", "럼", "면"].includes(lastC) || isEnglishChar(lastC)) && !isQuoteChar(nextC)) convertData.push(" ");
            while(["\n", " "].includes(str.charAt(++i)));
            i--;
            continue;
        }

        convertData.push(c);
    }

    return new class {
        toBlob() {
            return new Blob(convertData, {type: "text/plain"});
        }
    }
}