import dotenv from "dotenv";
dotenv.config();

import client from "./matrix/client";



client.start().then(() => console.log("Client started!"));
