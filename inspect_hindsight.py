import os
from hindsight_client import Hindsight
import inspect
import asyncio

async def test():
    h = Hindsight(api_key="test", base_url="https://api.hindsight.vectorize.io")
    print(f"arecall signature: {inspect.signature(h.arecall)}")
    print(f"aretain signature: {inspect.signature(h.aretain)}")

if __name__ == "__main__":
    asyncio.run(test())
