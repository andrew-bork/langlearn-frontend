"use client"

import styles from "./page.module.css";
import { useState } from "react";
import ChineseInput, { TokenCard } from "@/components/interactive-text-input/chinese-input";



export default function Home() {

    const [ tokens, setTokens ] = useState<string[]>([]);

    return (<>
            <div className="mb-8" style={{margin: "48px 0"}}>
                <h1 className="text-3xl font-bold mb-2">Chinese Language Learning</h1>
                <p className="">
                    Enter Chinese text, see translations, and add words to your flashcard deck
                </p>
            </div>
            
            <ChineseInput setTokens={setTokens} />
            <div className={styles["grid"]} >
                {tokens.map((token, i) => <TokenCard token={token} key={i}/>)}
            </div>
    </>
    );
}
