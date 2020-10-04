import { useState } from 'react';
import axios from 'axios';

const useRequest = ({ url, method, body, onSuccess }) => {
  // method: get , post, patch etv.
  const [errors, setErrors] = useState([]);

  const doRequest = async (props = {}) => {
    try {
      setErrors(null);
      const response = await axios[method](url, {
        ...body,
        ...props,
      });
      // if OnSuccessMethod is provided then call it after we reeceive a response
      if (onSuccess) {
        onSuccess(response.data);
      }
      return response.data;
    } catch (err) {
      setErrors(
        <div className="alert alert-danger">
          <h4>Oops...</h4>
          <ul className="my-0">
            {err.response.data.errors.map((err) => (
              <li key={err.message}>{err.message}</li>
            ))}
          </ul>
        </div>
      );

      // this allows throwing errors back and prevent rerouting if uncussessful
      // commented as we are using onSuccessMethod for rerouting.
      // throw err;
    }
  };

  return { doRequest, errors };
};

export default useRequest;
