import os
from hindsight_client import Hindsight
import inspect
import asyncio

async def test():
    h = Hindsight(api_key="test", base_url="https://api.hindsight.vectorize.io")
    print(f"Hindsight class: {Hindsight}")
    print(f"h.recall type: {type(h.recall)}")
    print(f"h.recall is coroutine function: {inspect.iscoroutinefunction(h.recall)}")
    
    # Let's try to look for other classes
    import hindsight_client
    print(f"hindsight_client members: {[m for m in dir(hindsight_client) if not m.startswith('__')]}")
    
    # Try to see methods
    print(f"Hindsight methods: {[m for m in dir(h) if not m.startswith('_')]}")

if __name__ == "__main__":
    asyncio.run(test())
