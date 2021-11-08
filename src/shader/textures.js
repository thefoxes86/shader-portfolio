import t1 from "../images/thum.jpeg";
import t5 from "../images/thum2.jpeg";
import t4 from "../images/thum3.jpeg";
import t2 from "../images/thum4.jpeg";
import t6 from "../images/thum5.jpeg";
import t3 from "../images/thum6.jpeg";
import bg from "../images/paper.png";
import { TextureLoader } from "three";

const images = [t1, t2, t3, t4, t5, t6];

const textures = images.map((url) => new TextureLoader().load(url));
const bgTexture = new TextureLoader().load(bg);

export { textures, bgTexture };
