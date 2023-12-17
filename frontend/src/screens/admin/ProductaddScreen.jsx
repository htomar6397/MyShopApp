import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Form, Button ,Image} from "react-bootstrap";

import Loader from "../../components/Loader";
import FormContainer from "../../components/FormContainer";
import { toast } from "react-toastify";
import {
    useCreateProductMutation,
 
  useGetProductsQuery,
 
 
} from "../../slices/productsApiSlice";


const ProductAddScreen = () => {
  

  const [name, setName] = useState("");
  const [price, setPrice] = useState(0);
  const [image, setImage] = useState([]);
 const [imgPreview, setImgPreview] = useState('');
  
  const [brand, setBrand] = useState("");
  const [category, setCategory] = useState("");
  const [countInStock, setCountInStock] = useState(0);
  const [description, setDescription] = useState("");

  

//   onClick = { createProductHandler };
 const [createProduct, { isLoading: loadingCreate }] =
   useCreateProductMutation();
 const { pageNumber } = useParams();
const { data, isLoading, error, refetch } = useGetProductsQuery({
  pageNumber,
});


  const navigate = useNavigate();

  const submitHandler = async (e) => {
    e.preventDefault();
    console.log(name,"submit")
     const myForm = new FormData();

     myForm.set("name", name);
     myForm.set("price", price);
     myForm.set("description", description);
     myForm.set("category", category);
     myForm.set("Stock", countInStock);
     myForm.set("brand", brand);
     myForm.set("image", image);
     myForm.set("countInStock", countInStock);
     console.log(image)
    try {
      await createProduct(myForm)
        .unwrap()
         // NOTE: here we need to unwrap the Promise to catch any rejection in our catch block
      toast.success("Product added successfully");
      refetch()
      navigate("/admin/productlist");
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };
 


 



  return (
    <>
      <Link to="/admin/productlist" className="btn btn-light my-3">
        Go Back
      </Link>
      <FormContainer>
        <h1>CREATE Product</h1>
        {loadingCreate && <Loader />}

        <Form encType="multipart/form-data" onSubmit={submitHandler}>
          <Form.Group controlId="name">
            <Form.Label>Name</Form.Label>
            <Form.Control
              type="name"
              placeholder="Enter name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required={true}
            ></Form.Control>
          </Form.Group>

          <Form.Group controlId="price">
            <Form.Label>Price</Form.Label>
            <Form.Control
              type="number"
              placeholder="Enter price"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required={true}
            ></Form.Control>
          </Form.Group>

          <Form.Group controlId="image">
            <Form.Label>Image</Form.Label>
            <Form.Control
              label="Choose File"
              onChange={(e) => {
                const files = Array.from(e.target.files);
                if (files.length > 0) {
                  files.forEach((file) => {
                    const reader = new FileReader();

                    reader.onload = () => {
                      if (reader.readyState === 2) {
                        setImage([reader.result]);
                        setImgPreview(reader.result);
                      }
                    };

                    reader.readAsDataURL(file);
                  });
                } else {
                  setImage([]);
                  setImgPreview("");
                }
              }}
              type="file"
              accept="image/*"
              required={true}
            ></Form.Control>

            {imgPreview ? (
              <Image src={imgPreview} alt={imgPreview.name} fluid rounded />
            ) : null}
          </Form.Group>

          <Form.Group controlId="brand">
            <Form.Label>Brand</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter brand"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              required={true}
            ></Form.Control>
          </Form.Group>

          <Form.Group controlId="countInStock">
            <Form.Label>Count In Stock</Form.Label>
            <Form.Control
              type="number"
              placeholder="Enter countInStock"
              value={countInStock}
              onChange={(e) => setCountInStock(e.target.value)}
              required={true}
            ></Form.Control>
          </Form.Group>

          <Form.Group controlId="category">
            <Form.Label>Category</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required={true}
            ></Form.Control>
          </Form.Group>

          <Form.Group controlId="description">
            <Form.Label>Description</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required={true}
            ></Form.Control>
          </Form.Group>

          <Button type="submit" variant="primary" style={{ marginTop: "1rem" }}>
            {loadingCreate ? <Loader />: "ADD"} 
          </Button>
        </Form>
      </FormContainer>
    </>
  );
};

export default ProductAddScreen;
