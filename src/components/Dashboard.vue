<template>
  <div class="hello">
    <div class="container">
      <div class="row">
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
          <form @submit.prevent="addProject" :disabled="! project">
            <div class="input-group">
              <input v-model="project" type="text" class="form-control" placeholder="First Add a Project by its ID..." autofocus>
              <span class="input-group-btn">
                <button class="btn btn-default" type="submit" :disabled="! project">Add Project ID</button>
              </span>
            </div>
          </form>

          <ul class="list-group">
            <li v-for="project in projects"
              class="list-group-item"
              :class="{completed: project.completed}"
              :key="project.id">
              <label>
                {{ project.text }}
              </label>
              <button @click.prevent=""
                class="btn btn-default"
                href="#">Add Task</button>
              <a @click.prevent="projects.splice(projects.indexOf(project), 1)"
                class="delete pull-right"
                href="#">Remove Project</a>
            </li>
          </ul>

        </div>
      </div>
    </div>
  </div>
</template>

<script>
var STORAGE_FILE = 'projects.json'

export default {
  name: 'dashboard',
  props: ['user'],
  data () {
    return {
      blockstack: window.blockstack,
      projects: [],
      project: '',
      uidCount: 0
    }
  },
  watch: {
    projects: {
      handler: function (projects) {
        const blockstack = this.blockstack
        const encrypt = true
        return blockstack.putFile(STORAGE_FILE, JSON.stringify(projects), encrypt)
      },
      deep: true
    }
  },
  mounted () {
    this.fetchData()
  },
  methods: {
    addProject () {
      if (!this.project.trim()) {
        return
      }
      this.projects.unshift({
        id: this.uidCount++,
        text: this.project.trim(),
        completed: false
      })
      this.project = ''
    },

    fetchData () {
      const blockstack = this.blockstack
      const decrypt = true
      blockstack.getFile(STORAGE_FILE, decrypt)
      .then((projectsText) => {
        var projects = JSON.parse(projectsText || '[]')
        projects.forEach(function (project, index) {
          project.id = index
        })
        this.uidCount = projects.length
        this.projects = projects
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

label {
  margin-bottom: 0;
  // width: 100%;
  cursor: pointer;
  input[type="checkbox"] {
    margin-right: 5px;
  }
}
.list-group-item {
  &.completed label {
    text-decoration: line-through;
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
