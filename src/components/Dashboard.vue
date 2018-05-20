<template>

  <!-- SOME  -->
  <div class="hello">

    <div class="container">
      <div class="row">
        <!-- <Modal for creating task -->
        <modal name="createTaskModal" :width="400" :height="200" >
          <div class="modal-main" >

            <h4 >Create new task</h4>
            <hr>
            
            <form @submit.prevent style="">
              <div class="form-group" >
                <label  for="task">Enter task name:</label>
                <input type="text"  class="form-control pull-right" v-model="taskName" placeholder="Please enter task name" id="task" >
              </div>

              <div class="form-group">
                <label :class="{on:status==='Complete', off:status==='Incomplete'}" for="status">Status:</label>
                  <!-- On of toggle button start -->
                  <toggle-button :value="false" 
                  @change="changeStatus"
                  color="rgb(52, 154, 129)" 
                  :sync="true"
                  style="margin-bottom:6px" 
                  :labels="{checked: 'on', unchecked: 'Off'}"/>
                  <!-- toggle button ends -->
                  <span>{{status}}</span>
              </div>

              <div>
                <button @click="createTask" class="btn btn-default btn-modal confirm pull-left" :disabled="! taskName" type="submit">Create</button>
                <button @click="$modal.hide('createTaskModal')" class="btn btn-default  btn-modal cancel pull-right" type="cancel">Cancel</button>
              </div>
            </form>
          </div>
        </modal>
        <!-- Modal for creating task ends -->

        <div class="col-md-8 col-md-offset-2">
          <h1 class="page-header">Souq Project Tasks
            <img :src="user.avatarUrl() ? user.avatarUrl() : '/avatar-placeholder.png'" class="avatar">
            <small><span class="sign-out">(<a href="#" @click.prevent="signOut">Sign Out</a>)</span></small>
          </h1>
          <h2 class="user-info">
            <small>
              {{ user.name() ? user.name() : 'Nameless Person'}}'s Project Tasks
            </small>
            <small class="pull-right">
            {{ user.username ? user.username : user.identityAddress }}
            </small>

          </h2>
          <!-- Form for creating project -->
          <form @submit.prevent="addProject" :disabled="! project">
            <div class="input-group">
              <input v-model="project" type="text" class="form-control" placeholder="First Add a Project by its ID..." autofocus>
              <span class="input-group-btn">
                <button class="btn btn-default" type="submit" :disabled="! project">Add Project ID</button>
              </span>
            </div>
          </form>
          <!-- Form for project creation ends -->

          <!-- List of projects and nested tasks -->
          <!-- Project list starts -->
          <ul class="list-group">
            <li v-for="project in projects"
              class="list-group-item"
              :class="{completed: project.completed}"
              :key="project.id">
              <label>
                {{ project.text }}
              </label>
              <button v-clipboard:copy="hubUrl + project.text + '.json'" class="btn btn-default" href="#">Copy Path</button>
              <button @click.prevent="addTask(project)" class="btn btn-default" href="#">Add New Task</button>
              <a @click.prevent="projects.splice(projects.indexOf(project), 1), updateProjectList(projects)" class="delete pull-right" href="#">Remove Project</a>
              <!-- Task list for project -->
              <ul class v-for="(tasks, index) in taskArray" v-if="tasks.id == project.id" :key='index' >
                <li :class="{completed: task.complete}" class="list-group-item task task-modal-font" v-for="(task, index) in tasks.tasks" :key="index">
                  <label>
                    {{task.name}}
                  </label>
                </li>
              </ul>
              <!-- Task list ends -->
            </li>
          </ul>
          <!-- Project list ends -->

        </div>
      </div>
    </div>
  </div>
</template>

<script>
// We are maintaining arrays for every project file,
// so that user can see the task and project lists updated in real time,
// we can stop maintaining local arrays but then for every new task/project or deleted task/project,
// we need to send a fetch request everytime. that makes the UI a little slow

var STORAGE_FILE = 'projects.json'

export default {
  name: 'dashboard',
  props: ['user'],
  data () {
    return {
      blockstack: window.blockstack,
      projects: [],
      taskArray: [],
      project: '',
      taskName: '',
      selectedProject: {},
      status: 'Incomplete',
      hubUrl: ''
    }
  },
  mounted () {
    // Finction to fetch projects file containing list of projects
    this.fetchProjectFile()
  },
  methods: {
    // Method for creating new task
    createTask (task) {
      let projectFileName = this.selectedProject.text // using current selected project name for creating new unique file
      this[projectFileName].manager = this.user._profile.name // entering manager name in project file
      this[projectFileName]['tasks'].unshift(
        {
          name: this.taskName.trim(),
          complete: this.status === 'Complete'
        }
      )

      this.$modal.hide('createTaskModal')
      this.blockstack.putFile(projectFileName + '.json', JSON.stringify(this[projectFileName]))
      this.$forceUpdate() // Vuejs method to update component
    },
    // function to add new project to projects file
    addProject () {
      if (!this.project.trim()) {
        return
      }
      this.projects.unshift({
        id: Date.now(), // making unique ids with milisecond timestamp
        text: this.project.trim(),
        completed: false
      })
      //  creating new json file with required data format for newly created project
      this.blockstack.putFile(this.project.trim() + '.json', JSON.stringify(this.projects[0]))

      this[this.projects[0].text] = this.projects[0]
      this[this.projects[0].text]['tasks'] = []

      this.project = ''
      // making entry for tasks of new project in task array
      this.taskArray.push(this[this.projects[0].text])
      // updating projects list
      this.updateProjectList(this.projects)
    },
    // function for changing task status according to the on/off switch in createTaskModal
    changeStatus (info) {
      if (info.value === true) {
        this.status = 'Complete'
      } else {
        this.status = 'Incomplete'
      }
    },
    // function for setting default values and opening CreateTaskModal
    addTask (project) {
      this.selectedProject = project
      this.taskName = ''
      this.status = 'Incomplete'
      this.$modal.show('createTaskModal')
    },

    // function for updating projects file containing project list
    updateProjectList (projects) {
      this.blockstack.putFile(STORAGE_FILE, JSON.stringify(projects))
    },

    // function for fetchin data project list and their unique json files
    fetchProjectFile () {
      // fetching project list
      this.blockstack.getFile(STORAGE_FILE)
      .then((projectsText) => {
        this.projects = JSON.parse(projectsText || '[]')
        this.taskArray = []
        // parsing blockstack gaia hub cong from localhost for creating hub url
        let urlItems = JSON.parse(localStorage['blockstack-gaia-hub-config'])
        // creating hub url(where our files are stored)
        this.hubUrl = urlItems.url_prefix + urlItems.address + '/'
        // looping over project list to fetch unique json files for every project
        for (var i = 0; i < this.projects.length; i++) {
          this.blockstack.getFile(this.projects[i].text + '.json').then((data1) => {
            let data = JSON.parse(data1)
            this[data.text] = data
            this[data.text].tasks = this[data.text].tasks || []
            // creating task array for listing tasks under their respective project
            this.taskArray.push(data)
          })
        }
      })
    },

    signOut () {
      this.blockstack.signUserOut(window.location.href)
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>

  input::placeholder {
    color: grey;
  }
  .on {
    margin-right: 13%;
  }
  .off {
    margin-right: 9%;
  }
  .modal-main {
    text-align: center;
    color: rgb(52, 154, 129);
    font-size: 13px;
    font-weight: 500;
    label {
      font-weight: 500;  
    }
  }
  .form-group {
    label {
    margin-top: 2%;
    }
    input {
      border-bottom-color:#92bab2;
      width: 60%
    }
  }
  .btn-modal {
    background-color: #47b79c;
    color: white;
    font-size: small;
    font-weight: 500;
    &.confirm {
      margin-left: 9%;
      margin-bottom: 2%;
    }
    &.cancel {
      margin-right: 9%;
      margin-bottom: 2%;
    }
    &:hover {
      background-color: #23caa3
    }
  }

  label {
    margin-bottom: 0;
    cursor: pointer;
    input[type="checkbox"] {
      margin-right: 5px;
    }
  }
  .list-group-item {
    &.completed label {
      text-decoration: line-through;
    }
    &.task {
      border: none;
      color: #777777;
      font-weight: 600;
      font-size: small;

    }

    .delete {
      display: none;
    }

    &:hover .delete {
      display: inline;
      color: grey;
      &:hover {
        text-decoration: none;
        color: red;
      }
    }
  }
</style>
