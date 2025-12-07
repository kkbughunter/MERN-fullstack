import { useEffect, useState } from "react";
import axios from "axios";

const API = "/products";

export default function App() {
  const [products, setProducts] = useState([]);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState(null);

  const fetchProducts = async () => {
    const res = await axios.get(API);
    setProducts(res.data);
  };

  useEffect(() => { fetchProducts(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    const form = new FormData();
    form.append("name", name);
    form.append("price", price);
    if (image) form.append("image", image);

    await axios.post(API, form);
    fetchProducts();
  };

  const remove = async (id) => {
    await axios.delete(`${API}/${id}`);
    fetchProducts();
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-3xl font-bold text-center mb-6">Product Manager</h2>

      <form onSubmit={submit} className="flex gap-3 mb-6">
        <input placeholder="Name" onChange={(e) => setName(e.target.value)} className="flex-1 px-4 py-2 border rounded" /> 
        <input placeholder="Price" onChange={(e) => setPrice(e.target.value)} className="flex-1 px-4 py-2 border rounded" />
        <input type="file" onChange={(e)=>setImage(e.target.files[0])} className="flex-1 px-4 py-2 border rounded"/>
        <button className="px-6 py-2 bg-green-500 text-white rounded hover:bg-green-600">Add</button>
      </form>

      <hr className="my-6" />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {products.map(p => (
          <div key={p._id} className="border rounded-lg p-4 shadow-md text-center">
            {p.image && <img src={p.image} alt={p.name} className="w-full h-40 object-cover rounded mb-3" />}
            <h4 className="text-xl font-semibold mb-2">{p.name}</h4>
            <p className="text-lg font-bold text-green-600 mb-3">₹ {p.price}</p>
            <button className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600" onClick={() => remove(p._id)}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
}
