import { useState, useEffect } from 'react';
import Router from 'next/router';
import useRequest from '../../hooks/use-request';
import StripeCheckout from 'react-stripe-checkout';

const OrderShow = ({ order, currentUser }) => {
  const [timeLeft, setTimeleft] = useState(0);

  const { doRequest, errors } = useRequest({
    url: '/api/payments',
    method: 'post',
    body: {
      orderId: order.id, // token will be added as props parameter
    },
    onSuccess: () => Router.push('/orders'),
  });

  useEffect(() => {
    const findTimeLeft = () => {
      const msLeft = new Date(order.expiresAt) - new Date(); // find time left
      setTimeleft(Math.round(msLeft / 1000)); // round it to seconds
    };

    findTimeLeft(); // needed for initital run other wise we will run this only after the first 1000 mi
    const timerId = setInterval(findTimeLeft, 1000); // set for every second
    // to stop or navigating away
    return () => {
      clearInterval(timerId);
    };
  }, [order]);

  if (timeLeft < 0) {
    return (
      <div>
        <h1>Order Expired !!!</h1>
        <h4>Expires At:{order.expiresAt}</h4>
        <h4>Id:{order.id}</h4>
        {errors}
      </div>
    );
  }

  return (
    <div>
      <h1>Order will expire in {timeLeft} seconds</h1>
      <h4>Expires At:{order.expiresAt}</h4>
      <h4>Id:{order.id}</h4>
      {errors}
      <div>
        <StripeCheckout
          token={({ id }) => doRequest({ token: id })}
          stripeKey="pk_test_51HW5oHKciI0VwvhezIJnfrO8H06u7Dy5yfaYWauiOLt5SM34xULBuuexAJvq1PPgeI4n8KqlmgWmYT5mHM8Ss9UV00G2Ug2WUZ"
          amount={order.ticket.price * 100}
          email={currentUser.email}
        />
      </div>
    </div>
  );
};

OrderShow.getInitialProps = async (context, client, currentUser) => {
  const { orderId } = context.query; // get the Order id from url
  const { data } = await client.get(`/api/orders/${orderId}`);
  return { order: data };
};

export default OrderShow;
