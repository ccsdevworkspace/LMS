import { api } from '../api/client';
import { useState } from 'react';

function Home() {
    const [num, setNum] = useState(0);
    const [result, setResult] = useState(null);

    const handleClick = async () => {
        try {
            const response = await api.post('/test', { num });
            setResult(response.data);
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div>
            <input
                type="number"
                value={num}
                onChange={(e) => setNum(e.target.value)}
            />
            <button onClick={handleClick}>Click Me!</button>

            {result && (
                <pre>{JSON.stringify(result, null, 2)}</pre>
            )}
        </div>
    );
}

export default Home;
