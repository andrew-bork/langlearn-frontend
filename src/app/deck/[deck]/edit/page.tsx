
import { database } from "@/actions/database";
import { ObjectId } from "mongodb";

import { TokenEditor } from "./token-editor";





export default async function DeckEditorPage({ params }: { params: Promise<{ deck: string }> }) {
  const deckID = (await params).deck;
  const deck = await database.collection("decks").findOne({
    _id: ObjectId.createFromBase64(deckID)
  });

  // const cards = (deck?.cards ?? []) as Flashcard[];

  return (
    <>
      <TokenEditor deckIDB64={deckID} cards={deck?.cards} deckId={ObjectId.createFromBase64(deckID).toHexString()}/>
    </>
  );
}