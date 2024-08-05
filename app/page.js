'use client'
import React,{useState, useEffect} from 'react';
import { collection, addDoc, getDoc, querySnapShot, query, onSnapshot, deleteDoc, doc, updateDoc} from "firebase/firestore";
import { db } from './firebase';

export default function Home() {
    const[items, setItems] = useState([]);
    const [newItem, setNewItem] = useState({ name: '', price: '' });
    const [total, setTotal] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');

    // Add item to database
    const addItem = async (e) => {
        e.preventDefault();
        if (newItem.name !== '' && newItem.price !== '') {
            // setItems([...items, newItem]);
            await addDoc(collection(db, 'items'), {
                name: newItem.name.trim(),
                price: newItem.price,
            });
            setNewItem({ name: '', price: '' });
        }
    };

    // Read items from database
    useEffect(() => {
        const q = query(collection(db, 'items'));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            let itemsArr = [];

            querySnapshot.forEach((doc) => {
                itemsArr.push({ ...doc.data(), id: doc.id });
            });
            setItems(itemsArr);

            // Read total from itemsArr
            const calculateTotal = () => {
                const totalPrice = itemsArr.reduce(
                    (sum, item) => sum + parseFloat(item.price),
                    0
                );
                setTotal(totalPrice);
            };
            calculateTotal(); // Call the function here
        });

        return () => unsubscribe();
    }, []);

    // Delete items from database
    const deleteItem = async (id) => {
        await deleteDoc(doc(db, 'items', id));
    };

    // Update item price in database (add)
    const updateItem = async (id, increment = true) => {
        const itemToUpdate = items.find(item => item.id === id);
        if (itemToUpdate) {
            const newPrice = increment
                ? parseFloat(itemToUpdate.price) + 1
                : parseFloat(itemToUpdate.price) - 1;

            if (newPrice < 0) {
                console.error("Price cannot be negative");
                return;
            }

            const itemRef = doc(db, 'items', id);
            try {
                await updateDoc(itemRef, {
                    price: newPrice
                });
            } catch (error) {
                console.error("Error updating document: ", error);
            }
        }
    };

    // Search items
    const filteredItems = items.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <main className='flex min-h-screen flex-col items-center justify-between sm:p-24 p-4'>
            <div className='z-10 w-full max-w-5xl items-center justify-between font-mono text-sm '>
                <h1 className='text-4xl p-4 text-center'>Pantry Tracker</h1>
                <div className='bg-slate-800 p-4 rounded-lg'>
                    <form className='grid grid-cols-6 items-center text-black'>
                        <input
                            value={newItem.name}
                            onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                            className='col-span-3 p-3 border'
                            type='text'
                            placeholder='Enter Item'
                        />
                        <input
                            value={newItem.price}
                            onChange={(e) =>
                                setNewItem({...newItem, price: e.target.value})
                            }
                            className='col-span-2 p-3 border mx-3'
                            type='number'
                            placeholder='Enter #'
                        />
                        <button
                            onClick={addItem}
                            className='text-white bg-slate-950 hover:bg-slate-900 p-3 text-xl'
                            type='submit'
                        >
                            +
                        </button>
                    </form>

                    <input
                        type="text"
                        placeholder="Search items..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="text-black p-2 border rounded w-full my-4"
                    />

                    <ul>
                        {filteredItems.map((item, id) => (
                            <li
                                key={id}
                                className='my-4 w-full flex justify-between bg-slate-950'
                            >

                                <div className='p-4 w-full flex justify-between'>
                                    <span className='capitalize'>{item.name}</span>
                                    <span># {item.price}</span>
                                </div>

                                <button
                                    onClick={() => updateItem(item.id, true)} // Increment price
                                    className='text-white bg-slate-950 hover:bg-slate-900 p-3 text-xl'
                                    type='button'
                                >+
                                </button>

                                <button
                                    onClick={() => updateItem(item.id, false)} // Decrement price
                                    className='text-white bg-slate-950 hover:bg-slate-900 p-3 text-xl'
                                    type='button'
                                >-
                                </button>

                                <button
                                    onClick={() => deleteItem(item.id)}
                                    className='ml-8 p-4 border-l-2 border-slate-900 hover:bg-slate-900 w-16'
                                >X
                                </button>
                            </li>
                        ))}
                    </ul>

                    {filteredItems.length < 1 ? (
                        ''
                    ) : (
                        <div className='flex justify-between p-3'>
                            <span>Total</span>
                            <span># {filteredItems.reduce((sum, item) => sum + parseFloat(item.price), 0)}</span>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}
