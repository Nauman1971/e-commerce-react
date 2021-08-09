import React, { useEffect, useState } from "react"
import { useSelector } from "react-redux";
import { useParams } from "react-router";
import { ProductCard } from "../components/cards/ProductCard";
import { SingleProduct } from "../components/cards/SingleProduct";
import { getProduct, getRelated, productStar } from "../functions/product";

export const Product = () => {
    const [product, setProduct] = useState({});
    const [star, setStar] = useState(0);
    const { user } = useSelector(state => ({ ...state }));
    const [related, setRelated] = useState([]);

    const { slug } = useParams();

    useEffect(() => {
        loadSingleProduct()
    }, [slug]);

    useEffect(() => {
        if (product.ratings && user) {
            // code snippet from server/product/conrollers
            let existingRatingObject = product.ratings.find(
                (ele) => (ele.postedBy.toString() === user._id.toString())
            );
            existingRatingObject && setStar(existingRatingObject.star); // current users star;

        }
    }, [])

    const loadSingleProduct = () => {

        getProduct(slug)
            .then(res => {
                setProduct(res.data);
                // load related 
                getRelated(res.data._id)
                    .then(res => setRelated(res.data))
            });
    }

    const onStarClick = (newRating, name) => {
        setStar(newRating);
        console.table(newRating, name);
        productStar(name, newRating, user.token)
            .then(res => {
                console.log('rating clicked', res.data);
                loadSingleProduct(); // if you want to show update rating real time;
            })
    }
    return (
        <div className="container fluid">
            <div className="row pt-4">
                <SingleProduct onStarClick={onStarClick} product={product} star={star} />
            </div>
            <div className="row">
                <div className="col text-center pt-5 pb-5">
                    <hr />
                    <h4>Related products</h4>
                    <hr />

                </div>
            </div>
            <div className="row pb-5">
                {related.length ? related.map((r) =>
                    <div key={r._id} className="col-md-4">
                        <ProductCard product={r} />
                    </div>) : <div className="text-center col">
                    No Products Found
                        </div>}
            </div>
        </div>
    )
}