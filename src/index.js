import Express from 'express';
import {connect} from './handlers';

const app = Express();
const port = 8888;

app.get('/', connect.connect);

app.listen(port);

