const OrderIndex = ({ orders }) => {
  return (
    <ul>
      {orders.map((order) => {
        return (
          <li key={order.id}>
            {order.ticket.title} - {order.status}
          </li>
        );
      })}
    </ul>
  );
};

// this is for next.js to do pre processing prior to executing LandingPage method.
// this is a plain function, useRequest is a hook and cannot be used here
OrderIndex.getInitialProps = async (context, client, currentUser) => {
  const { data } = await client.get('/api/orders');
  return { orders: data };
};

export default OrderIndex;
