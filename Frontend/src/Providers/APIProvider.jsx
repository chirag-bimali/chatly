"use strict";
import axios from "axios";
import APIContext from "../Context/APIContext";
import NetworkError from "../Exceptions/NetworkError";
import BadRequest from "../Exceptions/BadRequest";
import AuthenticationError from "../Exceptions/AuthenticationError";
import ArgumentError from "../Exceptions/ArgumentError";
import { useCallback } from "react";

let API_ROUTE = "http://localhost:5280/api";

export default function APIProvider({ children }) {
  async function searchUsers(query = "", page = 1, pageSize = 5, token = "") {
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
      console.log(e);
      if (e.code === "ERR_NETWORK") throw new NetworkError(e.message, { e });
      if (e.status === 401)
        throw new AuthenticationError("User not Authenticated");

      if (e.code === "ERR_BAD_REQUEST") {
        throw new BadRequest(e.message, e?.response, { e });
      }
      throw e;
    }
  }
  const getContacts = useCallback(async function (
    page = 1,
    pageSize = 10,
    token = ""
  ) {
    try {
      const route = `${API_ROUTE}/contacts/`;
      const response = await axios.get(route, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        param: {
          Page: page,
          PageSize: pageSize,
        },
      });
      return response?.data?.data;
    } catch (e) {
      console.error(e);
      throw e;
    }
  },
  []);
  const getContact = useCallback(async function ({ contactId, token }) {
    try {
      const route = `${API_ROUTE}/contacts/${contactId}`;
      var response = await axios.get(route, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (e) {
      console.log(e);
      throw e;
    }
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
    content,
    contactId,
    replyMessageId,
    forwardMessageId,
    token,
  }) {
    console.log(content);
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
  return (
    <APIContext.Provider
      value={{
        searchUsers,
        getContacts,
        getContact,
        getMessages,
        sendMessage,
      }}
    >
      {children}
    </APIContext.Provider>
  );
}
