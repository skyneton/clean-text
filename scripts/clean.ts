function TextCleaner(str: string) {
    const convertData:string[] = [];
    const quoteStack:string[] = [];
    let textOpen = 0;

    const quoteOrTextOpenCheck = c => {
        if(["(", "{", "[", "‘", "“"].includes(c)) textOpen++;
        else if([")", "}", "]", "’", "”"].includes(c)) textOpen--;
        else if(["\"", "'"].includes(c)) {
            if(quoteStack[quoteStack.length - 1] == c) quoteStack.pop();
            else quoteStack.push(c);
        }
    }

    const isKoChar = c => {
        c = c.charCodeAt(0);
        return 4352 <= c && c <= 4607 || 12592 <= c && c <= 12687 || 44032 <= c && c <= 55203;
    }

    const hasFirstKoChar = c => {
        const firstCharId = Math.floor((c.charCodeAt(0) - 44032)/588);
        return firstCharId >= 0 && firstCharId <= 18;
    }

    const isSpecialChar = c => {
        return ["!", "$", "%", "^", "&", "*", ":", ".", ",", "?", "/", "|"].includes(c);
    };

    const isSpecialEndChar = c => {
        return ["!", ".", "?"].includes(c);
    };

    const isQuoteChar = c => {
        return ["(", ")", "{", "}", "[", "]", "‘", "’", "“", "”", "\"", "'"].includes(c);
    }

    const isNotEndChar = c => {
        return isKoChar(c) && hasFirstKoChar(c) || isSpecialChar(c) && c == ",";
    }

    for(let i = 0; i < str.length; i++) {
        const c = str.charAt(i);
        const nextC = str.charAt(i+1);
        quoteOrTextOpenCheck(c);

        if(c == "\r") continue;
        if(c == " " && ["\n", "\r"].includes(nextC)) continue;

        if((textOpen > 0 || quoteStack.length > 0) && c == "\n") {
            if(nextC != "" && (![")", "}", "]", "’", "”", " "].includes(nextC) || ["\"", "'"].includes(nextC) && quoteStack[quoteStack.length - 1] != nextC)) convertData.push(" ");
            continue;
        }
        if((textOpen > 0 || quoteStack.length > 0) && c == " " && nextC != "" && ([")", "}", "]", "’", "”", " "].includes(nextC) || ["\"", "'"].includes(nextC) && quoteStack[quoteStack.length - 1] == nextC)) continue;

        if(nextC != "" && (isSpecialChar(c) || isKoChar(c) && !hasFirstKoChar(c)) && !["\n", "\r"].includes(nextC) && !(isQuoteChar(nextC) || isSpecialChar(c) && isSpecialChar(nextC) || isKoChar(c) && !hasFirstKoChar(c) && isKoChar(c) && !hasFirstKoChar(nextC))) {
            convertData.push(c);
            if(!(textOpen > 0 || quoteStack.length > 0) && isSpecialEndChar(c) && c != "\n") convertData.push("\n");
            else convertData.push(" ");
            continue;
        }

        const lastC = convertData[convertData.length - 1];
        // console.log(lastC, typeof lastC === "string" && lastC != "" && isKoChar(lastC) && hasFirstKoChar(lastC), ["\n", " "].includes(c));
        if((typeof lastC === "string" && lastC != "" && isNotEndChar(lastC) && ["\n", " "].includes(c) || isNotEndChar(c)) && nextC != "" && ["\n", "\r"].includes(nextC)) {
            if(c != "\n") convertData.push(c);
            if(["은", "는", "이", "가", "을", "를", "고", "기", "아", "의", "에", "만", "지", "로"].includes(c)) convertData.push(" ");
            while(["\n", "\r"].includes(str.charAt(++i)));
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