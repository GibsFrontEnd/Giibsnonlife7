"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MarketingChannelsTable } from "./marketing-channels-table"
import { CreateChannelDialog } from "./create-channel-dialog"
import { EditChannelDialog } from "./edit-channel-dialog"
import { DeleteChannelDialog } from "./delete-channel-dialog"
import { Plus } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export interface MarketingChannel {
  branchID: string
  channelID: string
  channelName: string
  branchName: string
  subChannels: SubChannel[]
}

export interface SubChannel {
  channelID: string
  subChannelID: string
  subChannelName: string
  description: string
}

export interface CreateChannelData {
  channelID: string
  channelName: string
  branchID: string
}

export interface UpdateChannelData {
  channelName: string
  branchID: string
}

export function MarketingChannelsPage() {
  const [channels, setChannels] = useState<MarketingChannel[]>([])
  const [loading, setLoading] = useState(true)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedChannel, setSelectedChannel] = useState<MarketingChannel | null>(null)
  const { toast } = useToast()

  // Fetch all marketing channels
  const fetchChannels = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/MktChannels")
      if (!response.ok) throw new Error("Failed to fetch channels")
      const data = await response.json()
      setChannels(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch marketing channels",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Create new channel
  const createChannel = async (data: CreateChannelData) => {
    try {
      const response = await fetch("/api/MktChannels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!response.ok) throw new Error("Failed to create channel")
      await fetchChannels()
      toast({
        title: "Success",
        description: "Marketing channel created successfully",
      })
      setCreateDialogOpen(false)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create marketing channel",
        variant: "destructive",
      })
    }
  }

  // Update channel
  const updateChannel = async (id: string, data: UpdateChannelData) => {
    try {
      const response = await fetch(`/api/MktChannels/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!response.ok) throw new Error("Failed to update channel")
      await fetchChannels()
      toast({
        title: "Success",
        description: "Marketing channel updated successfully",
      })
      setEditDialogOpen(false)
      setSelectedChannel(null)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update marketing channel",
        variant: "destructive",
      })
    }
  }

  // Delete channel
  const deleteChannel = async (id: string) => {
    try {
      const response = await fetch(`/api/MktChannels/${id}`, {
        method: "DELETE",
      })
      if (!response.ok) throw new Error("Failed to delete channel")
      await fetchChannels()
      toast({
        title: "Success",
        description: "Marketing channel deleted successfully",
      })
      setDeleteDialogOpen(false)
      setSelectedChannel(null)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete marketing channel",
        variant: "destructive",
      })
    }
  }

  // Handle edit action
  const handleEdit = (channel: MarketingChannel) => {
    setSelectedChannel(channel)
    setEditDialogOpen(true)
  }

  // Handle delete action
  const handleDelete = (channel: MarketingChannel) => {
    setSelectedChannel(channel)
    setDeleteDialogOpen(true)
  }

  useEffect(() => {
    fetchChannels()
  }, [])

  return (
    <div className="container mx-auto py-8 px-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold">Marketing Channels</CardTitle>
              <CardDescription>Manage your marketing channels and their configurations</CardDescription>
            </div>
            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Channel
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <MarketingChannelsTable
            channels={channels}
            loading={loading}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onRefresh={fetchChannels}
          />
        </CardContent>
      </Card>

      <CreateChannelDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} onSubmit={createChannel} />

      <EditChannelDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        channel={selectedChannel}
        onSubmit={updateChannel}
      />

      <DeleteChannelDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        channel={selectedChannel}
        onConfirm={deleteChannel}
      />
    </div>
  )
}
