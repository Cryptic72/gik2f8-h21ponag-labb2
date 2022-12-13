const express = require('express');
const app = express();
const fs = require('fs/promises');

const PORT = 5000;

app
  .use(express.json())
  .use(express.urlencoded({ extended: false }))
  .use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', '*');
    res.header('Access-Control-Allow-Methods', '*');

    next();
  });

app.get('/tasks', async (req, res) => {
  try {
    const tasks = await fs.readFile('./tasks.json');
    res.send(JSON.parse(tasks));
  } catch (error) {
    res.status(500).send({ error });
  }
});

app.post('/tasks', async (req, res) => {
  try {
    const task = req.body;

    const listBuffer = await fs.readFile('./tasks.json');
    const currentTasks = JSON.parse(listBuffer);
    let maxTaskId = 1;
    if (currentTasks && currentTasks.length > 0) {
      maxTaskId = currentTasks.reduce(
        (maxId, currentElement) => (currentElement.id > maxId ? currentElement.id : maxId),
        maxTaskId
      );
    }
    const newTask = { id: maxTaskId + 1, ...task };
    const newList = currentTasks ? [...currentTasks, newTask] : [newTask];

    await fs.writeFile('./tasks.json', JSON.stringify(newList));
    res.send(newTask);
  } catch (error) {
    res.status(500).send({ error: error.stack });
  }
});

app.delete('/tasks/:id', async (req, res) => {
  console.log(req);
  try {
    const id = req.params.id;
    const listBuffer = await fs.readFile('./tasks.json');
    const currentTasks = JSON.parse(listBuffer);
    if (currentTasks.length > 0) {
      await fs.writeFile('./tasks.json', JSON.stringify(currentTasks.filter((task) => task.id != id)));
      res.send({ message: `Uppgift med id ${id} togs bort` });
    } else {
      res.status(404).send({ error: 'Ingen uppgift att ta bort' });
    }
  } catch (error) {
    res.status(500).send({ error: error.stack });
  }
});


// For updating the completed status of tasks in "tasks.json". Depending on status of checkbox it contains either true or false.

app.put('/tasks/:id', async (req, res) => {
  try {
    const status = req.body.status;
    const id = req.params.id;
    const listBuffer = await fs.readFile('./tasks.json');
    const currentTasks = JSON.parse(listBuffer);
    if (status == true){
    for(let i = 0; i < currentTasks.length; i++){
      if(currentTasks[i]['id'] == id){
        currentTasks[i]['completed'] = true;
      }
    }
    await fs.writeFile('./tasks.json', JSON.stringify(currentTasks));
    res.send({ message: `Uppgift med id ${id} uppdaterades` });
  }
    else if (status == false){
      for(let i = 0; i < currentTasks.length; i++){
        if(currentTasks[i]['id'] == id){
          currentTasks[i]['completed'] = false;
        }
      }
      await fs.writeFile('./tasks.json', JSON.stringify(currentTasks));
      res.send({ message: `Uppgift med id ${id} uppdaterades` });
  };
  
  } 
  catch (error) {
    res.status(500).send({ error: error.stack });
  }
});

app.listen(PORT, () => console.log('Server running on http://localhost:5000'));
