import chromadb
from typing import List, Dict, Any, Optional

class InMemoryVectorDB:
    """
    In-memory ChromaDB vector store client.
    Never persists data to disk.
    """
    def __init__(self, collection_name: str = "legal_documents"):
        # EphemeralClient is strictly in-memory
        self.client = chromadb.EphemeralClient()
        self.collection_name = collection_name
        self.collection = self.client.get_or_create_collection(
            name=self.collection_name,
            metadata={"description": "In-memory legal document embeddings"}
        )

    def add_chunks(
        self,
        chunks: List[str],
        metadatas: Optional[List[Dict[str, Any]]] = None,
        ids: Optional[List[str]] = None
    ) -> int:
        """Add text chunks with metadata to the in-memory collection."""
        if not chunks:
            return 0
        if ids is None:
            ids = [f"chunk_{i}" for i in range(len(chunks))]
        if metadatas is None:
            metadatas = [{} for _ in chunks]

        self.collection.add(
            documents=chunks,
            metadatas=metadatas,
            ids=ids
        )
        return len(chunks)

    def query(self, query_text: str, n_results: int = 4) -> Dict[str, Any]:
        """Query similar chunks from the in-memory vector store."""
        count = self.collection.count()
        if count == 0:
            return {"documents": [[]], "metadatas": [[]], "distances": [[]]}
        
        limit = min(n_results, count)
        return self.collection.query(
            query_texts=[query_text],
            n_results=limit
        )

    def reset(self):
        """Reset and wipe current in-memory collection."""
        try:
            self.client.delete_collection(self.collection_name)
        except Exception:
            pass
        self.collection = self.client.get_or_create_collection(
            name=self.collection_name,
            metadata={"description": "In-memory legal document embeddings"}
        )

    def count(self) -> int:
        return self.collection.count()

# Global in-memory instance
vector_store = InMemoryVectorDB()
