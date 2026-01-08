"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  IconPlus,
  IconCheck,
  IconX,
  IconAlertTriangle,
  IconSettings,
  IconCurrency,
  IconTool,
  IconChevronRight,
  IconEdit,
  IconTrash,
  IconClipboard,
  IconCalculator,
  IconExclamationCircle,
  IconBuildingWarehouse
} from "@tabler/icons-react"

interface ProjectViewProps {
  projectName: string
  projectId: string
}

interface TodoItem {
  id: string
  title: string
  completed: boolean
  priority: "low" | "medium" | "high"
}

interface Fault {
  id: string
  title: string
  description: string
  severity: "low" | "medium" | "high" | "critical"
  status: "open" | "in_progress" | "resolved"
  createdAt: string
}

interface Expense {
  id: string
  description: string
  amount: number
  category: string
  date: string
}

export function ProjectView({ projectName, projectId }: ProjectViewProps) {
  const [todos, setTodos] = useState<TodoItem[]>([
    { id: "1", title: "Check engine oil level", completed: false, priority: "high" },
    { id: "2", title: "Replace air filter", completed: true, priority: "medium" },
    { id: "3", title: "Inspect brake pads", completed: false, priority: "high" },
  ])

  const [faults, setFaults] = useState<Fault[]>([
    {
      id: "1",
      title: "Heat AC Issue",
      description: "AC not blowing cold air consistently",
      severity: "medium",
      status: "open",
      createdAt: "2024-02-27"
    },
    {
      id: "2", 
      title: "Engine Oil Leak",
      description: "Small oil leak detected under engine bay",
      severity: "high",
      status: "in_progress",
      createdAt: "2024-02-20"
    }
  ])

  const [expenses, setExpenses] = useState<Expense[]>([
    { id: "1", description: "Oil Change", amount: 45.99, category: "Maintenance", date: "2024-02-15" },
    { id: "2", description: "New Brake Pads", amount: 89.50, category: "Parts", date: "2024-02-10" },
    { id: "3", description: "Diagnostic Fee", amount: 120.00, category: "Service", date: "2024-02-05" },
  ])

  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0)
  const budget = 1500.00

  const toggleTodo = (id: string) => {
    setTodos(todos.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ))
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical": return "bg-red-500"
      case "high": return "bg-orange-500"
      case "medium": return "bg-yellow-500"
      case "low": return "bg-green-500"
      default: return "bg-gray-500"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "border-l-red-500"
      case "medium": return "border-l-yellow-500"
      case "low": return "border-l-green-500"
      default: return "border-l-gray-500"
    }
  }

  return (
    <div className="flex-1 flex flex-col h-full app-bg-primary">
      {/* 3D Scene Header */}
      <div className="h-64 relative overflow-hidden" style={{ background: 'linear-gradient(to bottom right, var(--app-bg-secondary), var(--app-bg-tertiary))' }}>
        <div className="absolute inset-0 bg-grid-pattern opacity-10" />
        <div className="relative z-10 flex items-center justify-center h-full">
          <div className="text-center">
            <div className="w-32 h-32 mx-auto mb-4 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(to bottom right, var(--app-accent), #7BC785)', boxShadow: '0 0 20px rgba(139, 225, 150, 0.4)' }}>
              <IconBuildingWarehouse className="w-16 h-16 app-text-emphasis" />
            </div>
            <h1 className="app-h1 mb-2">{projectName}</h1>
            <p className="app-body app-text-secondary">Vehicle Project Dashboard</p>
          </div>
        </div>
      </div>

      {/* Main Content - Grid Layout like the example */}
      <div className="flex-1 p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
          
          {/* To-Do List Section */}
          <Card className="app-bg-secondary" style={{ border: '1px solid var(--app-border)' }}>
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <div className="flex items-center space-x-2">
                <IconClipboard className="w-5 h-5 app-text-accent" />
                <CardTitle className="app-text-primary app-h6">To-Do List</CardTitle>
              </div>
              <Button size="sm" className="app-button app-button-primary">
                <IconPlus className="w-4 h-4 mr-2" />
                Add Task
              </Button>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-80">
                <div className="space-y-3">
                  {todos.map((todo) => (
                    <div
                      key={todo.id}
                      className={`flex items-center space-x-3 p-3 border-l-4 ${getPriorityColor(todo.priority)} app-bg-tertiary rounded-r-lg transition-colors`}
                      style={{ backgroundColor: 'var(--app-bg-tertiary)' }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--app-bg-hover)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--app-bg-tertiary)'}
                    >
                      <button
                        onClick={() => toggleTodo(todo.id)}
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          todo.completed
                            ? ''
                            : ''
                        }`}
                        style={{
                          backgroundColor: todo.completed ? 'var(--app-accent)' : 'transparent',
                          borderColor: todo.completed ? 'var(--app-accent)' : 'var(--app-text-muted)'
                        }}
                        onMouseEnter={(e) => !todo.completed && (e.currentTarget.style.borderColor = 'var(--app-text-primary)')}
                        onMouseLeave={(e) => !todo.completed && (e.currentTarget.style.borderColor = 'var(--app-text-muted)')}
                      >
                        {todo.completed && <IconCheck className="w-3 h-3" style={{ color: '#000000' }} />}
                      </button>
                      <span className={`flex-1 app-body-sm ${todo.completed ? 'line-through app-text-muted' : 'app-text-primary'}`}>
                        {todo.title}
                      </span>
                      <Badge variant={todo.priority === 'high' ? 'destructive' : 'secondary'} className="app-caption">
                        {todo.priority}
                      </Badge>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Faults Section */}
          <Card className="app-bg-secondary" style={{ border: '1px solid var(--app-border)' }}>
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <div className="flex items-center space-x-2">
                <IconExclamationCircle className="w-5 h-5" style={{ color: 'var(--app-status-error)' }} />
                <CardTitle className="app-text-primary app-h6">Faults</CardTitle>
              </div>
              <Button size="sm" style={{ backgroundColor: 'var(--app-status-error)' }} className="hover:opacity-90">
                <IconPlus className="w-4 h-4 mr-2" />
                Report Issue
              </Button>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-80">
                <div className="space-y-3">
                  {faults.map((fault) => (
                    <div
                      key={fault.id}
                      className="p-3 app-bg-tertiary rounded-lg transition-colors"
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--app-bg-hover)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--app-bg-tertiary)'}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="app-fw-medium app-text-primary app-body-sm">{fault.title}</h4>
                        <Badge className={`${getSeverityColor(fault.severity)} app-caption`} style={{ color: 'var(--app-text-emphasis)' }}>
                          {fault.severity}
                        </Badge>
                      </div>
                      <p className="app-text-muted app-caption mb-2 line-clamp-2">{fault.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="app-caption app-text-muted">{fault.createdAt}</span>
                        <Badge variant="outline" className="app-caption" style={{ borderColor: 'var(--app-border)' }}>
                          {fault.status.replace('_', ' ')}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Manage Section */}
          <Card className="app-bg-secondary" style={{ border: '1px solid var(--app-border)' }}>
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <div className="flex items-center space-x-2">
                <IconTool className="w-5 h-5 app-text-accent" />
                <CardTitle className="app-text-primary app-h6">Manage</CardTitle>
              </div>
              <Button size="sm" variant="outline" className="app-body-sm" style={{ borderColor: 'var(--app-border)' }}>
                <IconSettings className="w-4 h-4 mr-2" />
                Settings
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Project Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="app-bg-tertiary p-3 rounded-lg text-center">
                    <div className="app-h3 app-text-primary">{todos.length}</div>
                    <div className="app-caption app-text-muted">Total Tasks</div>
                  </div>
                  <div className="app-bg-tertiary p-3 rounded-lg text-center">
                    <div className="app-h3 app-text-primary">
                      {faults.filter(f => f.status !== "resolved").length}
                    </div>
                    <div className="app-caption app-text-muted">Open Issues</div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="space-y-2">
                  <h4 className="app-body-sm app-fw-medium app-text-secondary mb-3">Quick Actions</h4>
                  <Button className="w-full justify-start app-body-sm h-9 app-text-secondary" variant="ghost">
                    <IconEdit className="w-4 h-4 mr-2" />
                    Edit Project Details
                  </Button>
                  <Button className="w-full justify-start app-body-sm h-9" variant="ghost" style={{ color: 'var(--app-status-error)' }}>
                    <IconTrash className="w-4 h-4 mr-2" />
                    <span>Archive Project</span>
                  </Button>
                  <Button className="w-full justify-start app-body-sm h-9 app-text-secondary" variant="ghost">
                    <IconAlertTriangle className="w-4 h-4 mr-2" />
                    Export Report
                  </Button>
                </div>

                {/* Project Progress */}
                <div className="space-y-2">
                  <h4 className="app-body-sm app-fw-medium app-text-secondary">Project Progress</h4>
                  <div className="w-full app-bg-tertiary rounded-full h-2">
                    <div
                      className="h-2 rounded-full"
                      style={{
                        width: `${(todos.filter(t => t.completed).length / todos.length) * 100}%`,
                        backgroundColor: 'var(--app-accent)'
                      }}
                    />
                  </div>
                  <p className="app-caption app-text-muted">
                    {todos.filter(t => t.completed).length} of {todos.length} tasks completed
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Budget & Expenses Section */}
          <Card className="app-bg-secondary" style={{ border: '1px solid var(--app-border)' }}>
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <div className="flex items-center space-x-2">
                <IconCalculator className="w-5 h-5" style={{ color: 'var(--app-status-warning)' }} />
                <CardTitle className="app-text-primary app-h6">Budget & Expenses</CardTitle>
              </div>
              <Button size="sm" className="app-button-primary">
                <IconPlus className="w-4 h-4 mr-2" />
                Add Expense
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Budget Overview */}
                <div className="app-bg-tertiary p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="app-body-sm app-text-muted">Budget Used</span>
                    <span className="app-h5 app-text-primary">
                      {((totalExpenses / budget) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full app-bg-hover rounded-full h-2 mb-2">
                    <div
                      className="h-2 rounded-full"
                      style={{
                        width: `${Math.min((totalExpenses / budget) * 100, 100)}%`,
                        backgroundColor: 'var(--app-accent)'
                      }}
                    />
                  </div>
                  <div className="flex justify-between app-caption app-text-muted">
                    <span>${totalExpenses.toFixed(2)} spent</span>
                    <span>${budget.toFixed(2)} total</span>
                  </div>
                </div>

                {/* Recent Expenses */}
                <div>
                  <h4 className="app-body-sm app-fw-medium app-text-secondary mb-3">Recent Expenses</h4>
                  <ScrollArea className="h-48">
                    <div className="space-y-2">
                      {expenses.map((expense) => (
                        <div
                          key={expense.id}
                          className="flex items-center justify-between p-2 app-bg-tertiary rounded transition-colors"
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--app-bg-hover)'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--app-bg-tertiary)'}
                        >
                          <div>
                            <div className="app-body-sm app-text-primary">{expense.description}</div>
                            <div className="app-caption app-text-muted">{expense.category} • {expense.date}</div>
                          </div>
                          <div className="app-body-sm app-fw-medium app-text-primary">${expense.amount.toFixed(2)}</div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  )
}