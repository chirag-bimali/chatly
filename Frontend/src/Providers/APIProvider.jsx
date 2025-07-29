"use strict";
import axios from "axios";
import APIContext from "../Context/APIContext";
import NetworkError from "../Exceptions/NetworkError";
import BadRequest from "../Exceptions/BadRequest";
import AuthenticationError from "../Exceptions/AuthenticationError";
import ArgumentError from "../Exceptions/ArgumentError";
import { useCallback } from "react";

let API_ROUTE = `${import.meta.env.VITE_API_URL}/api`;

export default function APIProvider({ children }) {
  async function searchUsers({
    query = "",
    page = 1,
    pageSize = 5,
    token = "",
  }) {
    try {
      let route = `${API_ROUTE}/Users/Search`;
      let response = await axios.get(route, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          Query: query,
          Page: page,
          PageSize: pageSize,
        },
      });
      return response.data;
    } catch (e) {
      if (e.code === "ERR_NETWORK") throw new NetworkError(e.message, { e });
      if (e.status === 401)
        throw new AuthenticationError("User not Authenticated");

      if (e.code === "ERR_BAD_REQUEST") {
        throw new BadRequest(e.message, e?.response, { e });
      }
      throw e;
    }
  }
  const getUserById = useCallback(async function ({ userId, token }) {
    if (!userId) {
      throw new ArgumentError("User id cannot be undefined");
    }
    const route = `${API_ROUTE}/Users/${userId}`;
    const response = await axios.get(route, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  }, []);
  const getContacts = useCallback(async function ({
    query = null,
    page = 1,
    pageSize = 10,
    token = "",
  }) {
    const route = `${API_ROUTE}/contacts/all`;
    const response = await axios.get(route, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: {
        Query: query,
        Page: page,
        PageSize: pageSize,
      },
    });
    return response?.data;
  },
  []);
  const createContact = useCallback(async function ({ contactUserId, token }) {
    const route = `${API_ROUTE}/contacts`;
    let response = await axios.post(
      route,
      {
        ContactUserId: contactUserId,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  }, []);
  const getContact = useCallback(async function ({ contactId, userId, token }) {
    const route = `${API_ROUTE}/contacts/`;
    let response = await axios.get(route, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: {
        ContactId: contactId,
        UserId: userId,
      },
    });
    return response.data;
  }, []);
  const getMessages = useCallback(async function ({
    contactId,
    skip = 0,
    take = 10,
    token,
  }) {
    if (!contactId)
      throw new ArgumentError(`Contact Id cannot be ${contactId}`);
    const route = `${API_ROUTE}/messages/readmessages`;

    const response = await axios.get(route, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: {
        ContactId: contactId,
        Skip: skip,
        Take: take,
      },
    });
    return response?.data;
  },
  []);
  const sendMessage = useCallback(async function ({
    contactId,
    content,
    replyMessageId,
    forwardMessageId,
    token,
  }) {
    const route = `${API_ROUTE}/messages/sendMessage`;
    const response = await axios.post(
      route,
      {
        ContactId: contactId,
        Content: content,
        ReplyMessageId: replyMessageId,
        ForwardMessageId: forwardMessageId,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  },
  []);

  const sendMessageToMany = useCallback(async function ({
    contactIds,
    content,
    replyMessageId,
    forwardMessageId,
    token,
  }) {
    const route = `${API_ROUTE}/messages/sendtomanymessage`;
    const response = await axios.post(
      route,
      {
        ContactIds: contactIds,
        Content: content,
        ReplyMessageId: replyMessageId,
        ForwardMessageId: forwardMessageId,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  },
  []);

  const changeContactStatus = useCallback(async function ({
    contactId,
    status,
    token,
  }) {
    let route = `${API_ROUTE}/contacts/status`;
    let response = await axios.patch(
      route,
      {
        ContactId: contactId,
        ContactStatus: status,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  },
  []);

  const changeName = useCallback(async function ({
    userName,
    displayName,
    themeName,
    token,
  }) {
    let route = `${API_ROUTE}/Users/UpdateMe`;
    let response = await axios.patch(
      route,
      {
        UserName: userName,
        DisplayName: displayName,
        Theme: themeName,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  },
  []);
  const changeEmail = useCallback(async function ({
    newEmail,
    password,
    token,
  }) {
    let route = `${API_ROUTE}/accounts/changeEmail`;
    let response = await axios.patch(
      route,
      {
        NewEmail: newEmail,
        Password: password,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  },
  []);

  const changeProfilePic = useCallback(async function ({ image, token }) {
    let route = `${API_ROUTE}/Users/UpdateProfilePicture`;
    let formData = new FormData();
    formData.append("image", image);
    let response = await axios.patch(route, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  }, []);

  const changePassword = useCallback(async function ({
    oldPassword,
    newPassword,
    token,
  }) {
    let route = `${API_ROUTE}/accounts/changePassword`;
    let response = await axios.patch(
      route,
      {
        OldPassword: oldPassword,
        NewPassword: newPassword,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  },
  []);

  const deleteAccount = useCallback(async function ({ token }) {
    let route = `${API_ROUTE}/users/deleteme`;
    let response = await axios.delete(route, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  }, []);

  return (
    <APIContext.Provider
      value={{
        searchUsers,
        getUserById,
        getContacts,
        getContact,
        getMessages,
        sendMessage,
        sendMessageToMany,
        createContact,
        changeContactStatus,
        changeName,
        changeProfilePic,
        changeEmail,
        changePassword,
        deleteAccount,
        API_ROUTE,
      }}
    >
      {children}
    </APIContext.Provider>
  );
}
