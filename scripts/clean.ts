function TextCleaner(str: string) {
    const convertData:string[] = [];
    const quoteStack:string[] = [];
    let textOpen = 0;

    // while((str.match(/\r\r/g) || []).length > 0) str = str.replace(/\r\r/g, "\r");
    str = str.replace(/\r\n/g, "\n");
    str = str.replace(/\r/g, "\n");

    const quoteOrTextOpenCheck = (c: string, nextC: string) => {
        if(["(", "{", "[", "‘", "“"].includes(c)) textOpen++;
        else if([")", "}", "]", "’", "”"].includes(c)) textOpen--;
        if(c == "'" && ["s", "t", "d", "l", "m", "v", "r"].includes(nextC)) return; //영어 단어 축약 제외
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
        return ["!", "$", "%", "^", "&", "*", ":", ".", ",", "?", "/", "|", "+", "=", "-", "_", "⋯", "…"].includes(c) || isQuoteChar(c);
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

    const koSpaceChar = (c: string) => {
        return ["은", "는", "이", "가", "을", "를", "고", "의", "에", "만", "로", "과", "던", "서", "해", "럼", "면", "도"].includes(c);
    }

    for(let i = 0; i < str.length; i++) {
        const llC = convertData[convertData.length - 2] || "";
        const lastC = convertData[convertData.length - 1] || "";
        const c = str.charAt(i);
        const nextC = str.charAt(i+1);
        const nnC = str.charAt(i+2);
        quoteOrTextOpenCheck(c, nextC);

        if(c == " " && nextC == "\n") continue;

        //"인용구""인용구" 변환
        if(textOpen <= 0 && quoteStack.length <= 0 && !isQuoteChar(lastC) && isQuoteChar(c) && c == nextC) {
            convertData.push(c);
            convertData.push("\n");
            continue;
        }

        //인용구 안의 엔터 변환
        if((textOpen > 0 || quoteStack.length > 0) && c == "\n") {
            if(nextC != "" && (![")", "}", "]", "’", "”", " "].includes(nextC) || ["\"", "'"].includes(nextC) && quoteStack[quoteStack.length - 1] != nextC) && lastC != " " && isKoChar(lastC) && koSpaceChar(lastC)) convertData.push(" ");
            continue;
        }
        if((textOpen > 0 || quoteStack.length > 0) && c == " " && nextC != "" && ([")", "}", "]", "’", "”", " "].includes(nextC) || ["\"", "'"].includes(nextC) && lastC == nextC)) continue;

        // if(nextC != "" && (isSpecialChar(c) || isKoChar(c) && !hasFirstKoChar(c)) && nextC != "\n" && !(isQuoteChar(nextC) || isSpecialChar(c) && isSpecialChar(nextC) || isKoChar(c) && !hasFirstKoChar(c) && isKoChar(c) && !hasFirstKoChar(nextC))) {
        if(nextC != "" && isSpecialChar(c) && nextC != "\n") {
            convertData.push(c);
            if(textOpen <= 0 && quoteStack.length <= 0 && isSpecialEndChar(c) && !isQuoteChar(nextC) && c != "\n" && c != " " && !isSpecialChar(nextC) && !isNumber(nextC) && nextC != " ") {
                convertData.push("\n");
            }
            else if(c != " " && nextC != " " && isSpecialEndChar(c) && !isSpecialChar(nextC) && !isQuoteChar(nextC)) convertData.push(" ");
            continue;
        }

        if(lastC != "" && isNotEndChar(lastC) && (lastC != " " || llC != " ") && (c == "\n" && nextC != "\n" && !isSpecialChar(nextC) || c == " " && nextC == "\n" && nnC != "\n" && !isSpecialChar(nnC)) && !(isKoChar(lastC) && isEnglishChar(nextC) || isEnglishChar(lastC) && isKoChar(nextC)) && (!isKoChar(lastC) || hasFirstKoChar(lastC))) {
            if ((koSpaceChar(lastC) || isEnglishChar(lastC)) && !isQuoteChar(nextC)) convertData.push(" ");
            while(["\n", " "].includes(str.charAt(++i)));
            i--;
            continue;
        }

        if(lastC == "겟" && (c == "다" || c == "따" || isSpecialChar(nextC))) {
            convertData.pop();
            convertData.push("겠");
        }

        else if(lastC == "었" && c == "군") {
            convertData.pop();
            convertData.push("였");
        }

        else if(lastC == "졋" && (c == "다" || c == "따" || isSpecialChar(nextC))) {
            convertData.pop();
            convertData.push("졌");
        }

        if(isSpecialChar(nextC)) {
            if(c == "따") convertData.push("다");
            else convertData.push(c);
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